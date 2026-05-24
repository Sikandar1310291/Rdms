import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const EMPTY_FORM = { cnic: '', first_name: '', last_name: '', gender: 'MALE', date_of_birth: '', contact_number: '', household: '', is_head_of_household: false };
const GENDER_TYPES = ['MALE', 'FEMALE', 'OTHER'];

const Beneficiaries = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [data, setData] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const canEdit = ['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR'].includes(user?.role);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get('/beneficiaries/'), api.get('/households/')])
      .then(([bRes, hRes]) => {
        setData(bRes.data);
        setHouseholds(hRes.data);
      })
      .catch(() => addToast('Failed to load beneficiaries', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (b) => { 
    setEditItem(b); 
    setForm({ 
      cnic: b.cnic, 
      first_name: b.first_name, 
      last_name: b.last_name, 
      gender: b.gender, 
      date_of_birth: b.date_of_birth, 
      contact_number: b.contact_number || '', 
      household: b.household, 
      is_head_of_household: b.is_head_of_household 
    }); 
    setModalOpen(true); 
  };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/beneficiaries/${editItem.id}/`, form);
        addToast('Beneficiary updated', 'success');
      } else {
        await api.post('/beneficiaries/', form);
        addToast('Beneficiary added', 'success');
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
      await api.delete(`/beneficiaries/${deleteId}/`);
      addToast('Beneficiary deleted', 'success');
      setDeleteId(null);
      load();
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const filtered = data.filter(b =>
    b.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.cnic?.includes(search)
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">◉ Beneficiaries</h1>
          <p className="page-subtitle">{data.length} registered individuals</p>
        </div>
        <div className="page-actions">
          {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Beneficiary</button>}
        </div>
      </div>

      <div className="glass-panel">
        <div className="toolbar" style={{ padding: '1.25rem 1.25rem 0' }}>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search by name or CNIC…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-wrapper" style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◉</div><div className="empty-text">No beneficiaries found</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>CNIC</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Household Head</th>
                  <th>Contact</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace' }}>{b.cnic}</td>
                    <td style={{ fontWeight: 600 }}>{b.first_name} {b.last_name}</td>
                    <td><span className="badge badge-default">{b.gender}</span></td>
                    <td>{b.is_head_of_household ? <span className="badge badge-success">Yes</span> : 'No'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.contact_number || '—'}</td>
                    {canEdit && (
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>✎ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(b.id)}>✕ Delete</button>
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? '✎ Edit Beneficiary' : '+ Add Beneficiary'}>
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
              <label className="form-label">Gender *</label>
              <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                {GENDER_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input type="date" className="form-control" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input className="form-control" value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Household *</label>
              <select className="form-control" value={form.household} onChange={e => setForm(f => ({ ...f, household: e.target.value }))} required>
                <option value="">Select Household</option>
                {households.map(h => <option key={h.id} value={h.id}>{h.household_code}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_head_of_household} onChange={e => setForm(f => ({ ...f, is_head_of_household: e.target.checked }))} />
                <span>Head of Household</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editItem ? 'Update Beneficiary' : 'Add Beneficiary'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="⚠ Confirm Delete">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Are you sure you want to delete this beneficiary?</p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Beneficiaries;
