import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const EMPTY_FORM = { item_name: '', item_type: 'FOOD', quantity_available: 0, unit: '', reorder_level: 5 };
const ITEM_TYPES = ['FOOD', 'WATER_EQUIPMENT', 'MEDICAL_SUPPLIES', 'SHELTER_EQUIPMENT', 'EDUCATION_MATERIAL', 'OTHER'];
const TYPE_COLORS = {
  FOOD: 'badge-success', WATER_EQUIPMENT: 'badge-primary', MEDICAL_SUPPLIES: 'badge-danger',
  SHELTER_EQUIPMENT: 'badge-warning', EDUCATION_MATERIAL: 'badge-info', OTHER: 'badge-default'
};

const Inventory = () => {
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
    api.get('/stock/').then(r => setData(r.data)).catch(() => addToast('Failed to load inventory', 'error')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (i) => { setEditItem(i); setForm({ item_name: i.item_name, item_type: i.item_type, quantity_available: i.quantity_available, unit: i.unit, reorder_level: i.reorder_level }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await api.patch(`/stock/${editItem.id}/`, form);
        addToast('Item updated successfully', 'success');
      } else {
        await api.post('/stock/', form);
        addToast('Item added successfully', 'success');
      }
      closeModal();
      load();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/stock/${deleteId}/`);
      addToast('Item deleted', 'success');
      setDeleteId(null);
      load();
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const filtered = data.filter(i =>
    i.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.item_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">▦ Inventory Stock</h1>
          <p className="page-subtitle">{data.length} items in warehouse</p>
        </div>
        <div className="page-actions">
          {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>}
        </div>
      </div>

      <div className="glass-panel">
        <div className="toolbar" style={{ padding: '1.25rem 1.25rem 0' }}>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 'auto' }} onChange={e => setSearch(e.target.value)}>
            <option value="">All Types</option>
            {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="table-wrapper" style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▦</div><div className="empty-text">No inventory found</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Reorder Level</th>
                  {canEdit && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                    <td><span className={`badge ${TYPE_COLORS[item.item_type] || 'badge-default'}`}>{item.item_type}</span></td>
                    <td style={{ color: item.quantity_available <= item.reorder_level ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {item.quantity_available}
                      {item.quantity_available <= item.reorder_level && ' ⚠'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.unit}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.reorder_level}</td>
                    {canEdit && (
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>✎ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(item.id)}>✕ Delete</button>
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

      <Modal isOpen={modalOpen} onClose={closeModal} title={editItem ? '✎ Edit Item' : '+ Add Item'}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Item Name *</label>
              <input className="form-control" value={form.item_name} onChange={e => setForm(f => ({ ...f, item_name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-control" value={form.item_type} onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))}>
                {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit (e.g. kg, boxes) *</label>
              <input className="form-control" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Available *</label>
              <input type="number" className="form-control" value={form.quantity_available} onChange={e => setForm(f => ({ ...f, quantity_available: e.target.value }))} required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input type="number" className="form-control" value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: e.target.value }))} min="0" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="⚠ Confirm Delete">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Are you sure you want to delete this inventory item?</p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
