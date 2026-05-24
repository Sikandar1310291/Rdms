import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const EMPTY_FORM = { name: '', budget_pkr: 0, spent_amount: 0, start_date: '', end_date: '', status: 'PLANNED' };
const STATUS_TYPES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'SUSPENDED'];
const STATUS_COLORS = {
  PLANNED: 'badge-default', ACTIVE: 'badge-success',
  COMPLETED: 'badge-primary', SUSPENDED: 'badge-danger'
};

const Projects = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const canEdit = ['ADMIN', 'NGO_MANAGER'].includes(user?.role);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/projects/').then(r => setData(r.data)).catch(() => addToast('Failed to load projects', 'error')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => { setEditItem(p); setForm({ name: p.name, budget_pkr: p.budget_pkr, spent_amount: p.spent_amount, start_date: p.start_date, end_date: p.end_date || '', status: p.status }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/projects/${editItem.id}/`, form);
        addToast('Project updated successfully', 'success');
      } else {
        await api.post('/projects/', form);
        addToast('Project added successfully', 'success');
      }
      closeModal();
      load();
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Save failed';
      if (data) {
        if (typeof data === 'string') msg = data;
        else if (data.detail) msg = data.detail;
        else {
          const firstKey = Object.keys(data)[0];
          msg = `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}`;
        }
      }
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deleteId}/`);
      addToast('Project deleted', 'success');
      setDeleteId(null);
      load();
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const filtered = data.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">◈ Projects Management</h1>
          <p className="page-subtitle">{data.length} active projects across regions</p>
        </div>
        <div className="page-actions">
          {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Create Project</button>}
        </div>
      </div>

      <div className="glass-panel">
        <div className="toolbar" style={{ padding: '1.25rem 1.25rem 0' }}>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search projects by name…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} onChange={e => setSearch(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div><div className="empty-text">No projects found</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Budget (PKR)</th>
                  <th>Spent (PKR)</th>
                  <th>Start Date</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span className={`badge ${STATUS_COLORS[p.status] || 'badge-default'}`}>{p.status}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>Rs. {parseFloat(p.budget_pkr).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>Rs. {parseFloat(p.spent_amount).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.start_date}</td>
                    {canEdit && (
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✎ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>✕ Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? '✎ Edit Project' : '+ New Project'}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Project Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Budget (PKR) *</label>
              <input type="number" className="form-control" value={form.budget_pkr} onChange={e => setForm(f => ({ ...f, budget_pkr: e.target.value }))} required min="0" step="1000" />
            </div>
            <div className="form-group">
              <label className="form-label">Spent (PKR)</label>
              <input type="number" className="form-control" value={form.spent_amount} onChange={e => setForm(f => ({ ...f, spent_amount: e.target.value }))} min="0" step="1000" />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input type="date" className="form-control" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Status *</label>
              <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editItem ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="⚠ Confirm Delete">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Are you sure you want to delete this project? This will remove all associated data permanently.</p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
