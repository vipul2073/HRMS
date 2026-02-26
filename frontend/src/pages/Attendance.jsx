import { useState, useEffect } from 'react'
import { employeeApi, attendanceApi } from '../api/index.js'
import toast from 'react-hot-toast'

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [recLoading, setRecLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [filters, setFilters] = useState({ employee_id: '', date: '', from_date: '', to_date: '' })

  useEffect(() => {
    employeeApi.getAll()
      .then(setEmployees)
      .catch(e => toast.error('Failed to load employees'))
      .finally(() => setLoading(false))
  }, [])

  const loadRecords = (params = {}) => {
    setRecLoading(true)
    // Remove empty params
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    attendanceApi.getAll(clean)
      .then(setRecords)
      .catch(e => toast.error(e.message))
      .finally(() => setRecLoading(false))
  }

  useEffect(() => { loadRecords() }, [])

  const applyFilters = () => loadRecords(filters)

  const clearFilters = () => {
    setFilters({ employee_id: '', date: '', from_date: '', to_date: '' })
    loadRecords()
  }

  const validate = () => {
    const errs = {}
    if (!form.employee_id) errs.employee_id = 'Please select an employee'
    if (!form.date) errs.date = 'Date is required'
    if (!form.status) errs.status = 'Status is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await attendanceApi.mark({ ...form, employee_id: parseInt(form.employee_id) })
      toast.success('Attendance marked successfully!')
      setShowModal(false)
      setForm({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' })
      setFormErrors({})
      loadRecords(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId)
    return emp ? emp.full_name : `Employee #${empId}`
  }

  const hasActiveFilters = Object.values(filters).some(v => v)

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{records.length} record{records.length !== 1 ? 's' : ''} found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={loading || employees.length === 0}>
          + Mark Attendance
        </button>
      </div>

      {employees.length === 0 && !loading && (
        <div className="error-state" style={{ marginBottom: '24px', borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)', color: 'var(--warning)' }}>
          ⚠ Add employees first before marking attendance.
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Filter Records
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ minWidth: '180px', flex: 1 }}>
            <label className="form-label">Employee</label>
            <select className="form-input" value={filters.employee_id} onChange={e => setFilters(f => ({ ...f, employee_id: e.target.value }))}>
              <option value="">All Employees</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" value={filters.from_date} onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" value={filters.to_date} onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '8px', paddingBottom: '0px' }}>
            <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
            {hasActiveFilters && (
              <button className="btn btn-ghost" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Records Table */}
      {recLoading ? (
        <div className="loading-wrapper">
          <div className="spinner" />
          <p className="loading-text">Loading records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-title">{hasActiveFilters ? 'No matching records' : 'No attendance records yet'}</p>
            <p className="empty-desc">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Click "Mark Attendance" to add the first record'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => {
                const emp = employees.find(e => e.id === record.employee_id)
                const d = new Date(record.date + 'T00:00:00')
                return (
                  <tr key={record.id}>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {d.toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{record.employee_name || getEmployeeName(record.employee_id)}</div>
                      {emp && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.employee_id}</div>}
                    </td>
                    <td>
                      {emp && (
                        <span className="badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent-light)', border: '1px solid rgba(108,99,255,0.3)' }}>
                          {emp.department}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                        {record.status === 'Present' ? '✓' : '✗'} {record.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setFormErrors({}) }}}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Mark Attendance</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setFormErrors({}) }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Employee *</label>
                <select
                  className="form-input"
                  value={form.employee_id}
                  onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                  style={formErrors.employee_id ? { borderColor: 'var(--danger)' } : {}}
                >
                  <option value="">Select employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                  ))}
                </select>
                {formErrors.employee_id && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{formErrors.employee_id}</span>}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={formErrors.date ? { borderColor: 'var(--danger)' } : {}}
                  />
                  {formErrors.date && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{formErrors.date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-input"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div style={{ padding: '12px 16px', background: 'rgba(108,99,255,0.08)', borderRadius: '8px', border: '1px solid rgba(108,99,255,0.2)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                ℹ If a record already exists for this employee on that date, it will be updated.
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setFormErrors({}) }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}