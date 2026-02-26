import { Outlet, NavLink, useLocation } from 'react-router-dom'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/employees', icon: '◎', label: 'Employees' },
  { to: '/attendance', icon: '◈', label: 'Attendance' },
]

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">◆</span>
          <div>
            <p className="logo-title">HRMS Lite</p>
            <p className="logo-sub">Admin Panel</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
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

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}