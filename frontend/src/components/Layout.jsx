import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/employees', icon: '◎', label: 'Employees' },
  { to: '/attendance', icon: '◈', label: 'Attendance' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">◆</span>
          <div>
            <p className="logo-title">HRMS Lite</p>
            <p className="logo-sub">Admin Panel</p>
          </div>
          {/* Close button on mobile */}
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-badge">
            <div className="admin-avatar">A</div>
            <div>
              <p className="admin-name">Admin</p>
              <p className="admin-role">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        {/* Mobile top bar */}
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="mobile-logo">
            <span className="logo-icon">◆</span>
            <span className="logo-title">HRMS Lite</span>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>

        <footer className="site-footer">
          <p>
            Developed by <strong>Vipul Nigam</strong> · For Demo Purpose Only · © {new Date().getFullYear()} All Rights Reserved to Vipul Nigam
          </p>
        </footer>
      </div>
    </div>
  )
}