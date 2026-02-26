import { useState, useEffect } from 'react'
import { dashboardApi } from '../api/index.js'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi.getSummary()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-wrapper">
      <div className="spinner" />
      <p className="loading-text">Loading dashboard...</p>
    </div>
  )

  if (error) return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Dashboard</h1></div>
      </div>
      <div className="error-state">⚠ {error}</div>
    </div>
  )

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{today}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">◎</div>
          <div>
            <div className="stat-value">{data.total_employees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">⊞</div>
          <div>
            <div className="stat-value">{data.total_departments}</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✓</div>
          <div>
            <div className="stat-value">{data.present_today}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red">✗</div>
          <div>
            <div className="stat-value">{data.absent_today}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Departments */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Employees by Department
          </h3>
          {data.departments.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">⊞</div>
              <p className="empty-desc">No departments yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.departments.map(dept => {
                const pct = data.total_employees > 0 ? Math.round((dept.count / data.total_employees) * 100) : 0
                return (
                  <div key={dept.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{dept.name}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{dept.count} • {pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top Employees */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            Top Attendance
          </h3>
          {data.top_present_employees.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">◈</div>
              <p className="empty-desc">No attendance records yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.top_present_employees.map((emp, i) => (
                <div key={emp.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: i === 0 ? 'var(--accent)' : 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.department}</p>
                  </div>
                  <span className="badge badge-success">{emp.present_days} days</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Total Records */}
      <div style={{ marginTop: '24px', padding: '16px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'var(--accent)', fontSize: '18px' }}>◈</span>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Total attendance records in system: <strong style={{ color: 'var(--text-primary)' }}>{data.total_attendance_records}</strong>
        </span>
      </div>
    </div>
  )
}