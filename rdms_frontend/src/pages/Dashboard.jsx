import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ icon, label, value, color, delta }) => (
  <div className="stat-card glass-panel" style={{ '--stat-color': color }}>
    <div className="stat-icon" style={{ background: `${color}22`, fontSize: '1.6rem' }}>
      {icon}
    </div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {delta && <div className="stat-delta">↑ {delta}</div>}
    </div>
  </div>
);

const ROLE_WELCOME = {
  ADMIN: 'Welcome back, Administrator',
  NGO_MANAGER: 'NGO Manager Dashboard',
  FIELD_COORDINATOR: 'Field Coordinator Overview',
  DONOR: 'Donor Portal',
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    beneficiaries: '…', projects: '…', inventory: '…',
    donors: '…', volunteers: '…',
  });
  const [recentActivity] = useState([
    { text: 'New donor registration completed', time: 'Just now', color: '#6366f1' },
    { text: 'Inventory stock updated — Food supplies', time: '2m ago', color: '#10b981' },
    { text: 'Project "Water Relief KPK" status changed to Active', time: '15m ago', color: '#f59e0b' },
    { text: 'Field assessment submitted for Village Machar', time: '1h ago', color: '#6366f1' },
    { text: 'Aid distribution logged for 12 households', time: '3h ago', color: '#10b981' },
  ]);

  useEffect(() => {
    const fetches = [
      api.get('/beneficiaries/').catch(() => ({ data: [] })),
      api.get('/projects/').catch(() => ({ data: [] })),
      api.get('/stock/').catch(() => ({ data: [] })),
      api.get('/donors/').catch(() => ({ data: [] })),
      api.get('/volunteers/').catch(() => ({ data: [] })),
    ];
    Promise.all(fetches).then(([b, p, i, d, v]) => {
      setStats({
        beneficiaries: b.data.length ?? 0,
        projects: p.data.length ?? 0,
        inventory: i.data.length ?? 0,
        donors: d.data.length ?? 0,
        volunteers: v.data.length ?? 0,
      });
    });
  }, []);

  const role = user?.role;

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">{ROLE_WELCOME[role] || 'Dashboard'}</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {(role === 'DONOR' || role === 'ADMIN' || role === 'NGO_MANAGER') && (
          <button className="btn btn-primary" onClick={() => navigate('/donors', { state: { openAddModal: true } })}>
            + Add Donor
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {(role !== 'DONOR') && (
          <StatCard icon="👤" label="Total Beneficiaries" value={stats.beneficiaries} color="#6366f1" delta="Active this month" />
        )}
        <StatCard icon="📋" label="Active Projects" value={stats.projects} color="#10b981" />
        {(role !== 'DONOR') && (
          <StatCard icon="📦" label="Inventory Items" value={stats.inventory} color="#f59e0b" />
        )}
        <StatCard icon="💰" label="Registered Donors" value={stats.donors} color="#ec4899" />
        {(role !== 'DONOR') && (
          <StatCard icon="🙋" label="Volunteers" value={stats.volunteers} color="#8b5cf6" />
        )}
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity */}
        <div className="glass-panel">
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <div className="section-title">🔔 Recent Activity</div>
          </div>
          <ul className="activity-list">
            {recentActivity.map((a, i) => (
              <li key={i} className="activity-item">
                <span className="activity-dot" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
                <span className="activity-text">{a.text}</span>
                <span className="activity-time">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-title">⚡ Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(role === 'ADMIN' || role === 'NGO_MANAGER' || role === 'DONOR') && (
              <button className="btn btn-primary" onClick={() => navigate('/donors', { state: { openAddModal: true } })}>
                ♦ Register New Donor
              </button>
            )}
            {(role === 'ADMIN' || role === 'NGO_MANAGER' || role === 'FIELD_COORDINATOR') && (
              <>
                <button className="btn btn-success" onClick={() => navigate('/beneficiaries')}>
                  ◉ Add Beneficiary
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/inventory')}>
                  ▦ Update Inventory
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/projects')}>
                  ◈ Manage Projects
                </button>
              </>
            )}
            {role === 'ADMIN' && (
              <button className="btn btn-ghost" onClick={() => navigate('/admin')}>
                ⚙ Admin Control Panel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
