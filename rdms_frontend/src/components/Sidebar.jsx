import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = {
  ADMIN: [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/admin', icon: '⚙', label: 'Admin Panel' },
    { to: '/donors', icon: '♦', label: 'Donors' },
    { to: '/projects', icon: '◈', label: 'Projects' },
    { to: '/beneficiaries', icon: '◉', label: 'Beneficiaries' },
    { to: '/inventory', icon: '▦', label: 'Inventory' },
    { to: '/volunteers', icon: '◎', label: 'Volunteers' },
    { to: '/reports', icon: '◧', label: 'Reports' },
  ],
  NGO_MANAGER: [
    { to: '/projects', icon: '◈', label: 'Projects' },
    { to: '/donors', icon: '♦', label: 'Donors' },
    { to: '/beneficiaries', icon: '◉', label: 'Beneficiaries' },
    { to: '/inventory', icon: '▦', label: 'Inventory' },
    { to: '/volunteers', icon: '◎', label: 'Volunteers' },
    { to: '/reports', icon: '◧', label: 'Reports' },
  ],
  FIELD_COORDINATOR: [
    { to: '/beneficiaries', icon: '◉', label: 'Beneficiaries' },
    { to: '/inventory', icon: '▦', label: 'Inventory' },
    { to: '/volunteers', icon: '◎', label: 'Volunteers' },
    { to: '/projects', icon: '◈', label: 'Projects' },
  ],
  DONOR: [
    { to: '/donors', icon: '♦', label: 'My Donations' },
  ],
};

const ROLE_LABELS = {
  ADMIN: 'Super Admin',
  NGO_MANAGER: 'NGO Manager',
  FIELD_COORDINATOR: 'Field Coordinator',
  DONOR: 'Donor / Sponsor',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS['FIELD_COORDINATOR'];
  const initials = (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">🌿</div>
          <div className="brand-text">
            <span className="brand-name">RDMS</span>
            <span className="brand-sub">Relief &amp; Dev. Mgmt</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user.first_name || user.username}</div>
            <div className="user-role">{ROLE_LABELS[user.role] || user.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <span>⇤</span> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
