# HRMS Lite — Human Resource Management System

A lightweight, production-ready Human Resource Management System built with **React**, **Flask**, and **PostgreSQL**.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend (Vercel) | https://hrms-c836q9e4i-vipul2073s-projects.vercel.app |
| 🔌 Backend API (Render) | https://hrms-7jbi.onrender.com |
| 📁 GitHub Repository | https://github.com/vipul2073/HRMS |

> ⚠️ **Note:** Backend is hosted on Render's free tier. First request may take 30–50 seconds to wake up.

---

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
> Overview of total employees, departments, today's attendance, department-wise breakdown and top attendance performers.

### Employee List
![Employees](./screenshots/employees.png)
> View all employees with search, department badges, and actions to View or Delete.

### Add Employee
![Add Employee](./screenshots/add-employee.png)
> Modal form to add a new employee with full validation — unique ID, email format, required fields.

### Attendance Tracking
![Attendance](./screenshots/attendance.png)
> Mark and view attendance records with date range filters, Present/Absent status badges.

---

## ✅ Features

### Core Features
- **Employee Management**
  - Add employee with ID, Full Name, Email, Department
  - View all employees in a searchable table
  - Delete employee (cascades attendance records)
  - View individual employee profile with attendance history

- **Attendance Management**
  - Mark attendance as Present or Absent per employee per date
  - Auto-updates if record already exists for that date (upsert)
  - View all attendance records
  - Filter by employee and date range

### Bonus Features
- ✅ Dashboard with summary statistics
- ✅ Department-wise employee breakdown with progress bars
- ✅ Top attendance performers leaderboard
- ✅ Total present days per employee
- ✅ Date range filter on attendance records
- ✅ Attendance rate percentage per employee

### UI/UX
- ✅ Loading states on all data fetches
- ✅ Empty states with helpful messages
- ✅ Error states with clear messages
- ✅ Toast notifications for all actions
- ✅ Fully responsive professional dark UI
- ✅ Search/filter on employee list

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Create React App) |
| Routing | React Router v6 |
| Notifications | React Hot Toast |
| Backend | Flask (Python) |
| ORM | SQLAlchemy |
| Database | PostgreSQL |
| CORS | Flask-CORS |
| Production Server | Gunicorn |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Render PostgreSQL (Free) |

---

## 📁 Project Structure

```
HRMS/
├── backend/
│   ├── app.py              # Flask app — models, routes, validation
│   ├── requirements.txt    # Python dependencies
│   ├── runtime.txt         # Python version pin (3.11)
│   ├── Procfile            # Gunicorn start command for Render
│   └── .env.example        # Environment variable template
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── index.js        # Centralized API service layer
    │   ├── components/
    │   │   ├── Layout.jsx      # Sidebar + navigation shell
    │   │   └── Layout.css      # All shared styles & design system
    │   ├── pages/
    │   │   ├── Dashboard.jsx   # Summary stats & charts
    │   │   ├── Employees.jsx   # Employee list, add, delete
    │   │   ├── EmployeeDetail.jsx  # Per-employee attendance view
    │   │   └── Attendance.jsx  # Mark & filter attendance
    │   ├── App.js              # Route definitions
    │   ├── index.js            # React entry point
    │   └── index.css           # CSS variables & base styles
    └── package.json
```

---

## 🔌 API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| POST | `/api/employees` | Add new employee |
| GET | `/api/employees/:id` | Get employee + full attendance history |
| DELETE | `/api/employees/:id` | Delete employee (cascades attendance) |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List records (supports filters) |
| POST | `/api/attendance` | Mark or update attendance |
| DELETE | `/api/attendance/:id` | Delete a record |

**Query params for GET /api/attendance:** `employee_id`, `date`, `from_date`, `to_date`

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Summary stats — counts, departments, top employees |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check if API is running |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL installed and running

### 1. Clone the repository
```bash
git clone https://github.com/vipul2073/HRMS.git
cd HRMS
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create the database
psql -U postgres -c "CREATE DATABASE hrms_db;"

# Create .env file
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# Edit .env and set your database password:
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hrms_db

# Run Flask (auto-creates all tables on first run)
python app.py
```
✅ Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the app
npm start
```
✅ Frontend runs at: `http://localhost:3000`

> The `"proxy": "http://localhost:5000"` in `package.json` automatically forwards all `/api` requests to Flask in development.

---

## ☁️ Deployment

### Backend → Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect GitHub repo, set root to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn app:app`
6. Create a **PostgreSQL** database on Render
7. Add env variable: `DATABASE_URL` = Internal Database URL from Render
8. Deploy

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Connect GitHub repo, set root to `frontend/`
3. Add env variable: `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

---

## ✔️ Validation Rules

- All fields are required — returns `400` with field name if missing
- Email must match valid format (`user@domain.com`)
- Employee ID must be unique — returns `409` on duplicate
- Email must be unique — returns `409` on duplicate
- Attendance status must be exactly `Present` or `Absent`
- Date must be in `YYYY-MM-DD` format
- If attendance record already exists for employee + date, it is **updated** (upsert)
- Deleting an employee **cascades** and removes all their attendance records

---

## ⚠️ Assumptions & Limitations

- Single admin user — no authentication or login required
- Leave management, payroll, and multi-user roles are out of scope
- Departments are a fixed preset list (Engineering, Design, HR, Finance, etc.)
- Free tier on Render has cold start delay (~30–50 seconds on first request after inactivity)
- Designed for desktop use; mobile layout not optimized
