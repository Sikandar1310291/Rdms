import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const EMPTY_FORM = { name: '', donor_type: 'INDIVIDUAL', email: '', phone: '', address: '' };
const DONOR_TYPES = ['INDIVIDUAL', 'CORPORATE', 'NGO_PARTNER', 'INTERNATIONAL'];
const TYPE_COLORS = {
  INDIVIDUAL: 'badge-primary', CORPORATE: 'badge-success',
  NGO_PARTNER: 'badge-warning', INTERNATIONAL: 'badge-danger'
};

const Donors = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const canEdit = ['ADMIN', 'NGO_MANAGER'].includes(user?.role);
  const canAdd  = ['ADMIN', 'NGO_MANAGER', 'DONOR'].includes(user?.role);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/donors/').then(r => setData(r.data)).catch(() => addToast('Failed to load donors', 'error')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (location.state?.openAddModal && canAdd) {
      openAdd();
      // Clear the state so it doesn't reopen on subsequent renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, canAdd, navigate, location.pathname]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (d) => { setEditItem(d); setForm({ name: d.name, donor_type: d.donor_type, email: d.email, phone: d.phone || '', address: d.address || '' }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/donors/${editItem.id}/`, form);
        addToast('Donor updated successfully', 'success');
      } else {
        await api.post('/donors/', form);
        addToast('Donor added successfully', 'success');
      }
      closeModal();
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/donors/${deleteId}/`);
      addToast('Donor deleted', 'success');
      setDeleteId(null);
      load();
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const filtered = data.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.donor_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">♦ Donor Registry</h1>
          <p className="page-subtitle">{data.length} donors registered in the system</p>
        </div>
        <div className="page-actions">
          {canAdd && (
            <button className="btn btn-primary" onClick={openAdd}>+ Add Donor</button>
          )}
        </div>
      </div>

      <div className="glass-panel">
        {/* Toolbar */}
        <div className="toolbar" style={{ padding: '1.25rem 1.25rem 0' }}>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search by name, email, type…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {canEdit && (
            <select className="form-control" style={{ width: 'auto' }} onChange={e => setSearch(e.target.value)}>
              <option value="">All Types</option>
              {DONOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>

        {/* Table */}
        <div className="table-wrapper" style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">♦</div>
              <div className="empty-text">No donors found</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Email</th>
                  <th>Phone</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><span className={`badge ${TYPE_COLORS[d.donor_type] || 'badge-default'}`}>{d.donor_type}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.phone || '—'}</td>
                    {canEdit && (
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>✎ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d.id)}>✕ Delete</button>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? '✎ Edit Donor' : '+ Add New Donor'}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Donor Type *</label>
              <select className="form-control" value={form.donor_type} onChange={e => setForm(f => ({ ...f, donor_type: e.target.value }))}>
                {DONOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300 0000000" />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Address</label>
              <textarea className="form-control" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editItem ? 'Update Donor' : 'Add Donor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="⚠ Confirm Delete">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Are you sure you want to delete this donor? This action cannot be undone.
        </p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Donors;
