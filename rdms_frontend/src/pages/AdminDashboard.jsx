import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const panels = [
    { title: 'User Management', desc: 'Manage system users, roles, and permissions', icon: '👥', color: '#6366f1', count: 12 },
    { title: 'System Logs', desc: 'View system activity and error logs', icon: '📝', color: '#10b981', count: 854 },
    { title: 'Database Settings', desc: 'Configure database connections and backups', icon: '🗄️', color: '#f59e0b', count: 3 },
    { title: 'Global Configurations', desc: 'Application-wide settings and variables', icon: '⚙️', color: '#ec4899', count: 24 },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">⚙ System Admin Panel</h1>
          <p className="page-subtitle">Super Admin control center</p>
        </div>
      </div>

      <div className="admin-grid">
        {panels.map((p, i) => (
          <div key={i} className="admin-card glass-panel" style={{ borderTop: `4px solid ${p.color}` }}>
            <span className="admin-card-icon">{p.icon}</span>
            <div className="admin-card-count" style={{ color: p.color }}>{p.count}</div>
            <h3 className="admin-card-title">{p.title}</h3>
            <p className="admin-card-desc">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Advanced Data Management</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          As a Super Admin, you have full access to view, edit, and delete all records across the system. 
          Use the main navigation to access specific modules.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/donors')}>Manage Donors</button>
          <button className="btn btn-primary" onClick={() => navigate('/projects')}>Manage Projects</button>
          <button className="btn btn-primary" onClick={() => navigate('/beneficiaries')}>Manage Beneficiaries</button>
          <button className="btn btn-primary" onClick={() => navigate('/inventory')}>Manage Inventory</button>
          <button className="btn btn-primary" onClick={() => navigate('/volunteers')}>Manage Volunteers</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
