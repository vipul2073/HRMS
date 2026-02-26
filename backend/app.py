from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import date, datetime
import re
import os

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/hrms_db')
# Handle Render's postgres:// vs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ─── Models ──────────────────────────────────────────────────────────────────

class Employee(db.Model):
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    attendances = db.relationship('Attendance', backref='employee', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_attendance=False):
        data = {
            'id': self.id,
            'employee_id': self.employee_id,
            'full_name': self.full_name,
            'email': self.email,
            'department': self.department,
            'created_at': self.created_at.isoformat()
        }
        if include_attendance:
            data['attendances'] = [a.to_dict() for a in self.attendances]
        return data


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # 'Present' or 'Absent'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('employee_id', 'date', name='unique_employee_date'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'employee_name': self.employee.full_name if self.employee else None,
            'date': self.date.isoformat(),
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }


# ─── Helpers ─────────────────────────────────────────────────────────────────

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def error_response(message, status_code):
    return jsonify({'error': message}), status_code

def success_response(data, status_code=200):
    return jsonify(data), status_code


# ─── Employee Routes ──────────────────────────────────────────────────────────

@app.route('/api/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.order_by(Employee.created_at.desc()).all()
    return success_response([e.to_dict() for e in employees])


@app.route('/api/employees', methods=['POST'])
def create_employee():
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    required = ['employee_id', 'full_name', 'email', 'department']
    missing = [f for f in required if not data.get(f, '').strip()]
    if missing:
        return error_response(f"Missing required fields: {', '.join(missing)}", 400)

    if not validate_email(data['email']):
        return error_response('Invalid email address format', 400)

    if Employee.query.filter_by(employee_id=data['employee_id'].strip()).first():
        return error_response(f"Employee ID '{data['employee_id']}' already exists", 409)

    if Employee.query.filter_by(email=data['email'].strip().lower()).first():
        return error_response(f"Email '{data['email']}' is already registered", 409)

    employee = Employee(
        employee_id=data['employee_id'].strip(),
        full_name=data['full_name'].strip(),
        email=data['email'].strip().lower(),
        department=data['department'].strip()
    )
    db.session.add(employee)
    db.session.commit()

    return success_response(employee.to_dict(), 201)


@app.route('/api/employees/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return error_response('Employee not found', 404)
    return success_response(employee.to_dict(include_attendance=True))


@app.route('/api/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    employee = Employee.query.get(emp_id)
    if not employee:
        return error_response('Employee not found', 404)

    db.session.delete(employee)
    db.session.commit()
    return success_response({'message': f"Employee '{employee.full_name}' deleted successfully"})


# ─── Attendance Routes ────────────────────────────────────────────────────────

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    employee_id = request.args.get('employee_id')
    date_filter = request.args.get('date')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')

    query = Attendance.query

    if employee_id:
        query = query.filter_by(employee_id=employee_id)

    if date_filter:
        try:
            parsed_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
            query = query.filter_by(date=parsed_date)
        except ValueError:
            return error_response('Invalid date format. Use YYYY-MM-DD', 400)

    if from_date:
        try:
            parsed_from = datetime.strptime(from_date, '%Y-%m-%d').date()
            query = query.filter(Attendance.date >= parsed_from)
        except ValueError:
            return error_response('Invalid from_date format. Use YYYY-MM-DD', 400)

    if to_date:
        try:
            parsed_to = datetime.strptime(to_date, '%Y-%m-%d').date()
            query = query.filter(Attendance.date <= parsed_to)
        except ValueError:
            return error_response('Invalid to_date format. Use YYYY-MM-DD', 400)

    records = query.order_by(Attendance.date.desc()).all()
    return success_response([r.to_dict() for r in records])


@app.route('/api/attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    if not data:
        return error_response('Request body is required', 400)

    required = ['employee_id', 'date', 'status']
    missing = [f for f in required if not str(data.get(f, '')).strip()]
    if missing:
        return error_response(f"Missing required fields: {', '.join(missing)}", 400)

    if data['status'] not in ['Present', 'Absent']:
        return error_response("Status must be 'Present' or 'Absent'", 400)

    employee = Employee.query.get(data['employee_id'])
    if not employee:
        return error_response('Employee not found', 404)

    try:
        parsed_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return error_response('Invalid date format. Use YYYY-MM-DD', 400)

    existing = Attendance.query.filter_by(
        employee_id=data['employee_id'],
        date=parsed_date
    ).first()

    if existing:
        existing.status = data['status']
        db.session.commit()
        return success_response(existing.to_dict())

    attendance = Attendance(
        employee_id=data['employee_id'],
        date=parsed_date,
        status=data['status']
    )
    db.session.add(attendance)
    db.session.commit()
    return success_response(attendance.to_dict(), 201)


@app.route('/api/attendance/<int:record_id>', methods=['DELETE'])
def delete_attendance(record_id):
    record = Attendance.query.get(record_id)
    if not record:
        return error_response('Attendance record not found', 404)
    db.session.delete(record)
    db.session.commit()
    return success_response({'message': 'Attendance record deleted'})


# ─── Dashboard Route ──────────────────────────────────────────────────────────

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    total_employees = Employee.query.count()
    total_departments = db.session.query(Employee.department).distinct().count()
    total_attendance = Attendance.query.count()
    present_today = Attendance.query.filter_by(date=date.today(), status='Present').count()
    absent_today = Attendance.query.filter_by(date=date.today(), status='Absent').count()

    # Per department count
    from sqlalchemy import func
    dept_counts = db.session.query(
        Employee.department, func.count(Employee.id)
    ).group_by(Employee.department).all()

    # Top present employees
    top_present = db.session.query(
        Employee.full_name,
        Employee.department,
        func.count(Attendance.id).label('present_days')
    ).join(Attendance).filter(Attendance.status == 'Present').group_by(
        Employee.id, Employee.full_name, Employee.department
    ).order_by(func.count(Attendance.id).desc()).limit(5).all()

    return success_response({
        'total_employees': total_employees,
        'total_departments': total_departments,
        'total_attendance_records': total_attendance,
        'present_today': present_today,
        'absent_today': absent_today,
        'departments': [{'name': d, 'count': c} for d, c in dept_counts],
        'top_present_employees': [
            {'name': n, 'department': d, 'present_days': p}
            for n, d, p in top_present
        ]
    })


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'HRMS API is running'})


# ─── Init DB ──────────────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=5000)