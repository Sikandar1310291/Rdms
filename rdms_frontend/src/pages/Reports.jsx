import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const TABS = [
  { id: 'project-utilization', label: 'Project Budget Utilization' },
  { id: 'donor-impact', label: 'Donor Impact Analysis' },
  { id: 'inventory-shortages', label: 'Inventory Shortages' },
  { id: 'poverty-profile', label: 'Village Poverty Profile' },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#0ea5e9'];

const Reports = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData(null);
    api.get(`/reports/${activeTab}/`)
      .then(res => setData(res.data))
      .catch(() => addToast('Failed to load report data', 'error'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const renderContent = () => {
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
    if (!data || data.length === 0) return <div className="empty-state"><div className="empty-text">No data available for this report.</div></div>;

    switch (activeTab) {
      case 'project-utilization':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Budget vs Spent (PKR)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="project_name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="budget_pkr" name="Total Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent_pkr" name="Amount Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Status</th>
                    <th>Utilization</th>
                    <th>Remaining (PKR)</th>
                    <th>Items Distributed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{d.project_name}</td>
                      <td><span className="badge badge-default">{d.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '100px', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(d.utilization_percentage, 100)}%`, height: '100%', background: d.utilization_percentage > 90 ? '#ef4444' : '#10b981' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.utilization_percentage}%</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{parseFloat(d.remaining_pkr).toLocaleString()}</td>
                      <td>{d.total_items_distributed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'donor-impact':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
                <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Total Donations Share</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="total_donated_pkr" nameKey="donor_name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                      {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Impact Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Donors</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{data.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Highest Donation</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#10b981' }}>
                      Rs. {Math.max(...data.map(d => parseFloat(d.total_donated_pkr))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Donor Name</th>
                    <th>Type</th>
                    <th>Total Donated</th>
                    <th>Allocated</th>
                    <th>Projects Funded</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{d.donor_name}</td>
                      <td><span className="badge badge-default">{d.donor_type}</span></td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>Rs. {parseFloat(d.total_donated_pkr).toLocaleString()}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>Rs. {parseFloat(d.total_allocated_pkr).toLocaleString()}</td>
                      <td>{d.projects_funded_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'inventory-shortages':
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Type</th>
                  <th>Available</th>
                  <th>Reorder Level</th>
                  <th>Shortage Deficit</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.item_name}</td>
                    <td>{d.item_type}</td>
                    <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{d.quantity_available} {d.unit}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.reorder_level} {d.unit}</td>
                    <td>
                      <span className="badge badge-danger">Needs {d.shortage_deficit} {d.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'poverty-profile':
        return (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Village</th>
                  <th>District</th>
                  <th>Households</th>
                  <th>Avg Monthly Income</th>
                  <th>Avg Poverty Score</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{d.village_name}</td>
                    <td>{d.district_name} ({d.province})</td>
                    <td>{d.total_households}</td>
                    <td style={{ fontFamily: 'monospace' }}>Rs. {parseFloat(d.avg_monthly_income_pkr).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '80px', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${d.avg_poverty_score}%`, height: '100%', background: d.avg_poverty_score > 60 ? '#ef4444' : '#f59e0b' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: d.avg_poverty_score > 60 ? '#ef4444' : 'inherit' }}>{d.avg_poverty_score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">◧ Reports & Analytics</h1>
          <p className="page-subtitle">Deep insights into NGO operations and impact</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '500px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
