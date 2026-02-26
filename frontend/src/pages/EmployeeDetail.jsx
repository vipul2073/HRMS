import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { employeeApi, attendanceApi } from '../api/index.js'
import toast from 'react-hot-toast'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })
  const [attendance, setAttendance] = useState([])
  const [attLoading, setAttLoading] = useState(false)

  useEffect(() => {
    employeeApi.getById(id)
      .then(data => {
        setEmployee(data)
        setAttendance(data.attendances || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const applyFilter = async () => {
    setAttLoading(true)
    try {
      const params = { employee_id: id }
      if (dateFilter.from) params.from_date = dateFilter.from
      if (dateFilter.to) params.to_date = dateFilter.to
      const data = await attendanceApi.getAll(params)
      setAttendance(data)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAttLoading(false)
    }
  }

  const clearFilter = async () => {
    setDateFilter({ from: '', to: '' })
    setAttLoading(true)
    try {
      const data = await attendanceApi.getAll({ employee_id: id })
      setAttendance(data)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAttLoading(false)
    }
  }

  const presentDays = attendance.filter(a => a.status === 'Present').length
  const absentDays = attendance.filter(a => a.status === 'Absent').length
  const rate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0

  if (loading) return (
    <div className="loading-wrapper">
      <div className="spinner" />
      <p className="loading-text">Loading employee details...</p>
    </div>
  )

  if (error) return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('/employees')} style={{ marginBottom: '24px' }}>
        ← Back
      </button>
      <div className="error-state">⚠ {error}</div>
    </div>
  )

  return (
    <div className="animate-in">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/employees')} style={{ marginBottom: '24px' }}>
        ← Back to Employees
      </button>

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '700', color: 'white', flexShrink: 0,
            fontFamily: 'Syne, sans-serif'
          }}>
            {employee.full_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 className="page-title" style={{ fontSize: '22px', marginBottom: '4px' }}>{employee.full_name}</h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-info">{employee.employee_id}</span>
              <span className="badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent-light)', border: '1px solid rgba(108,99,255,0.3)' }}>{employee.department}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{employee.email}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '32px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne', color: 'var(--success)' }}>{presentDays}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Present</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne', color: 'var(--danger)' }}>{absentDays}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Absent</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne', color: 'var(--accent-light)' }}>{rate}%</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: '700' }}>Attendance History</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFilter.from} onChange={e => setDateFilter(f => ({ ...f, from: e.target.value }))} />
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>to</span>
          <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFilter.to} onChange={e => setDateFilter(f => ({ ...f, to: e.target.value }))} />
          <button className="btn btn-primary btn-sm" onClick={applyFilter}>Filter</button>
          {(dateFilter.from || dateFilter.to) && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilter}>Clear</button>
          )}
        </div>
      </div>

      {attLoading ? (
        <div className="loading-wrapper" style={{ padding: '40px' }}>
          <div className="spinner" />
        </div>
      ) : attendance.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-title">No attendance records</p>
            <p className="empty-desc">
              {(dateFilter.from || dateFilter.to) ? 'No records for the selected date range' : 'Go to Attendance to mark records for this employee'}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(record => {
                const d = new Date(record.date + 'T00:00:00')
                return (
                  <tr key={record.id}>
                    <td style={{ fontWeight: '500' }}>{d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.toLocaleDateString('en-US', { weekday: 'long' })}</td>
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
    </div>
  )
}