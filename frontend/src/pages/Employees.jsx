import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeeApi } from '../api/index.js'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Legal', 'Support']

const INITIAL_FORM = { employee_id: '', full_name: '', email: '', department: '' }

export default function Employees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
//   const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')

  const loadEmployees = () => {
    setLoading(true)
    employeeApi.getAll()
      .then(setEmployees)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEmployees() }, [])

  const validate = () => {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required'
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.department) errs.department = 'Department is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await employeeApi.create(form)
      toast.success('Employee added successfully!')
      setShowModal(false)
      setForm(INITIAL_FORM)
      setFormErrors({})
      loadEmployees()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (emp) => {
    // if (!confirm(`Delete "${emp.full_name}"? This will also remove their attendance records.`)) return
    if (!window.confirm(`Delete "${emp.full_name}"? This will also remove their attendance records.`)) return
    try {
      await employeeApi.delete(emp.id)
      toast.success('Employee deleted')
      setEmployees(prev => prev.filter(e => e.id !== emp.id))
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Employee
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <div className="search-bar" style={{ maxWidth: '380px' }}>
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            placeholder="Search by name, ID, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner" />
          <p className="loading-text">Loading employees...</p>
        </div>
      ) : error ? (
        <div className="error-state">⚠ {error}</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <p className="empty-title">{search ? 'No results found' : 'No employees yet'}</p>
            <p className="empty-desc">
              {search ? `No employees match "${search}"` : 'Add your first employee to get started'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <span className="badge badge-info">{emp.employee_id}</span>
                  </td>
                  <td>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '14px' }}
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      {emp.full_name}
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
                  <td>
                    <span className="badge badge-info" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent-light)', borderColor: 'rgba(108,99,255,0.3)' }}>
                      {emp.department}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/employees/${emp.id}`)}>
                        View
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setForm(INITIAL_FORM); setFormErrors({}) }}}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Employee</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setForm(INITIAL_FORM); setFormErrors({}) }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Employee ID *</label>
                  <input
                    className={`form-input ${formErrors.employee_id ? 'input-error' : ''}`}
                    placeholder="e.g. EMP-001"
                    value={form.employee_id}
                    onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                    style={formErrors.employee_id ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {formErrors.employee_id && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{formErrors.employee_id}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-input"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    style={formErrors.department ? { borderColor: 'var(--danger)' } : {}}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {formErrors.department && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{formErrors.department}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  style={formErrors.full_name ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.full_name && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{formErrors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={formErrors.email ? { borderColor: 'var(--danger)' } : {}}
                />
                {formErrors.email && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{formErrors.email}</span>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setForm(INITIAL_FORM); setFormErrors({}) }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}