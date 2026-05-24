import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const EMPTY_FORM = { first_name: '', last_name: '', cnic: '', contact_number: '', email: '', status: 'AVAILABLE' };
const STATUS_TYPES = ['AVAILABLE', 'ON_ASSIGNMENT', 'INACTIVE'];
const STATUS_COLORS = {
  AVAILABLE: 'badge-success', ON_ASSIGNMENT: 'badge-warning', INACTIVE: 'badge-default'
};

const Volunteers = () => {
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

  const canEdit = ['ADMIN', 'FIELD_COORDINATOR'].includes(user?.role);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/volunteers/').then(r => setData(r.data)).catch(() => addToast('Failed to load volunteers', 'error')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (v) => { setEditItem(v); setForm({ first_name: v.first_name, last_name: v.last_name, cnic: v.cnic, contact_number: v.contact_number, email: v.email, status: v.status }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/volunteers/${editItem.id}/`, form);
        addToast('Volunteer updated', 'success');
      } else {
        await api.post('/volunteers/', form);
        addToast('Volunteer added', 'success');
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
      await api.delete(`/volunteers/${deleteId}/`);
      addToast('Volunteer deleted', 'success');
      setDeleteId(null);
      load();
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const filtered = data.filter(v =>
    v.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.cnic?.includes(search)
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">◎ Volunteer Roster</h1>
          <p className="page-subtitle">{data.length} registered volunteers</p>
        </div>
        <div className="page-actions">
          {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Volunteer</button>}
        </div>
      </div>

      <div className="glass-panel">
        <div className="toolbar" style={{ padding: '1.25rem 1.25rem 0' }}>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search by name or CNIC…" value={search} onChange={e => setSearch(e.target.value)} />
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
              <div className="empty-icon">◎</div><div className="empty-text">No volunteers found</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>CNIC</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Status</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontWeight: 600 }}>{v.first_name} {v.last_name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{v.cnic}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.contact_number}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.email}</td>
                    <td><span className={`badge ${STATUS_COLORS[v.status] || 'badge-default'}`}>{v.status}</span></td>
                    {canEdit && (
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>✎ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(v.id)}>✕ Delete</button>
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? '✎ Edit Volunteer' : '+ Add Volunteer'}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-control" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-control" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">CNIC *</label>
              <input className="form-control" value={form.cnic} onChange={e => setForm(f => ({ ...f, cnic: e.target.value }))} required placeholder="00000-0000000-0" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input className="form-control" value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status *</label>
              <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editItem ? 'Update Volunteer' : 'Add Volunteer'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="⚠ Confirm Delete">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Are you sure you want to remove this volunteer?</p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Volunteers;
