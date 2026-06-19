import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save, 
  Edit, 
  Check, 
  X,
  LayoutGrid,
  ShieldAlert
} from 'lucide-react';
import { addProduct, updateProduct, deleteProduct, resetDatabase } from '../db/storage';

export default function AdminPanel({ database, onUpdateDb }) {
  const { suites, products } = database;

  // Edit State
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    suiteId: suites[0]?.id || '',
    tier: 'good',
    price: '',
    targetSales: '',
    weeklyVolume: '',
    lastWeekVolume: ''
  });

  const [formError, setFormError] = useState('');

  // Handle Edit Action
  const handleStartEdit = (product) => {
    setEditingProductId(product.id);
    setEditForm({ ...product });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim() || editForm.price <= 0 || editForm.weeklyVolume < 0) {
      alert("Please enter valid product details.");
      return;
    }
    
    // Convert string inputs back to numbers
    const updated = {
      ...editForm,
      price: parseFloat(editForm.price),
      targetSales: parseInt(editForm.targetSales),
      weeklyVolume: parseInt(editForm.weeklyVolume),
      lastWeekVolume: parseInt(editForm.lastWeekVolume)
    };

    // Update current month volume in history (last index)
    if (updated.history && updated.history.length > 0) {
      updated.history[updated.history.length - 1].volume = updated.weeklyVolume;
    }

    const newDb = updateProduct(updated);
    onUpdateDb(newDb);
    setEditingProductId(null);
  };

  // Handle Delete Action
  const handleDeleteProduct = (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const newDb = deleteProduct(productId);
      onUpdateDb(newDb);
    }
  };

  // Reset to Defaults
  const handleResetDb = () => {
    if (confirm("Are you sure you want to reset the database to default cybersecurity values? Any changes will be lost.")) {
      const newDb = resetDatabase();
      onUpdateDb(newDb);
      // Reset forms
      setNewProduct({
        name: '',
        suiteId: suites[0]?.id || '',
        tier: 'good',
        price: '',
        targetSales: '',
        weeklyVolume: '',
        lastWeekVolume: ''
      });
      setFormError('');
    }
  };

  // Handle Add Action
  const handleAddProduct = (e) => {
    e.preventDefault();
    setFormError('');

    const { name, suiteId, tier, price, targetSales, weeklyVolume, lastWeekVolume } = newProduct;

    if (!name.trim()) return setFormError('Product Name is required.');
    if (!price || parseFloat(price) <= 0) return setFormError('Price must be a positive number.');
    if (!targetSales || parseInt(targetSales) < 0) return setFormError('Target sales volume cannot be negative.');
    if (!weeklyVolume || parseInt(weeklyVolume) < 0) return setFormError('Current volume cannot be negative.');
    if (!lastWeekVolume || parseInt(lastWeekVolume) < 0) return setFormError('Last week volume cannot be negative.');

    // Generate 13-month history based on current volume (with a simulated upward growth back in time)
    const history = [];
    const months = ['Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'];
    const curVol = parseInt(weeklyVolume);
    months.forEach((m, idx) => {
      // Linear progression: starts at 75% of current volume and reaches current volume in the final month
      const factor = 0.75 + (idx / 12) * 0.25;
      history.push({ month: m, volume: Math.round(curVol * factor) });
    });

    const added = {
      id: 'prod-' + Date.now(),
      suiteId,
      name,
      tier,
      price: parseFloat(price),
      targetSales: parseInt(targetSales),
      weeklyVolume: curVol,
      lastWeekVolume: parseInt(lastWeekVolume),
      history
    };

    const newDb = addProduct(added);
    onUpdateDb(newDb);

    // Reset Form
    setNewProduct({
      name: '',
      suiteId: suiteId, // Keep current selected suite for ease of adding multiple
      tier: 'good',
      price: '',
      targetSales: '',
      weeklyVolume: '',
      lastWeekVolume: ''
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Catalog Administration</h1>
          <p className="page-subtitle">Configure product metrics, adjust pricing plans, and simulate inventory updates.</p>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={handleResetDb} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }}>
            <RotateCcw size={16} /> Reset Default Database
          </button>
        </div>
      </div>

      <div className="admin-grid">
        {/* Left Column: Database Catalog List */}
        <div className="detail-card" style={{ padding: '1.5rem' }}>
          <h3 className="detail-card-title">
            <LayoutGrid size={18} color="var(--color-primary)" />
            Active Cybersecurity Products
          </h3>
          
          {suites.map(suite => {
            const suiteProds = products.filter(p => p.suiteId === suite.id);
            return (
              <div key={suite.id} style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  color: 'var(--color-primary-dark)',
                  backgroundColor: 'var(--color-primary-light)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontWeight: 600
                }}>
                  {suite.name}
                </h4>

                <div className="table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Tier</th>
                        <th>Product Name</th>
                        <th style={{ width: '100px' }}>Price ($)</th>
                        <th style={{ width: '90px' }}>Current Vol</th>
                        <th style={{ width: '90px' }}>Last Wk Vol</th>
                        <th style={{ width: '90px' }}>Target Vol</th>
                        <th style={{ width: '110px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suiteProds.map(p => {
                        const isEditing = editingProductId === p.id;
                        return (
                          <tr key={p.id}>
                            <td>
                              {isEditing ? (
                                <select 
                                  value={editForm.tier} 
                                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                                  className="form-control"
                                  style={{ padding: '0.25rem', fontSize: '0.8rem' }}
                                >
                                  <option value="good">Good</option>
                                  <option value="better">Better</option>
                                  <option value="best">Best</option>
                                </select>
                              ) : (
                                <span className={`tier-badge ${p.tier}`}>{p.tier}</span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="text" 
                                  value={editForm.name} 
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="form-control"
                                  style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                                />
                              ) : (
                                <span className="product-name">{p.name}</span>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  value={editForm.price} 
                                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                  className="form-control"
                                  style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                                />
                              ) : (
                                <strong>${p.price}</strong>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  value={editForm.weeklyVolume} 
                                  onChange={(e) => setEditForm({ ...editForm, weeklyVolume: e.target.value })}
                                  className="form-control"
                                  style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                                />
                              ) : (
                                p.weeklyVolume
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  value={editForm.lastWeekVolume} 
                                  onChange={(e) => setEditForm({ ...editForm, lastWeekVolume: e.target.value })}
                                  className="form-control"
                                  style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                                />
                              ) : (
                                p.lastWeekVolume
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  value={editForm.targetSales} 
                                  onChange={(e) => setEditForm({ ...editForm, targetSales: e.target.value })}
                                  className="form-control"
                                  style={{ padding: '0.25rem', fontSize: '0.85rem' }}
                                />
                              ) : (
                                p.targetSales
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                  <button onClick={handleSaveEdit} className="btn btn-primary" style={{ padding: '0.35rem', borderRadius: '4px' }}>
                                    <Check size={14} />
                                  </button>
                                  <button onClick={handleCancelEdit} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: '4px' }}>
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                                  <button onClick={() => handleStartEdit(p)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: '4px' }} title="Edit Product">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: '4px', color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)' }} title="Delete Product">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Add New Product Form */}
        <div className="detail-card" style={{ height: 'fit-content' }}>
          <h3 className="detail-card-title">
            <Plus size={18} color="var(--color-primary)" />
            Add New Product
          </h3>
          
          <form onSubmit={handleAddProduct}>
            {formError && (
              <div style={{ 
                backgroundColor: 'var(--color-danger-bg)', 
                color: 'var(--color-danger)', 
                border: '1px solid var(--color-danger-border)',
                padding: '0.75rem',
                borderRadius: 'var(--border-radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldAlert size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="form-group">
              <label>Product Name</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Identity Guard Plus"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Suite</label>
                <select 
                  className="form-control"
                  value={newProduct.suiteId}
                  onChange={(e) => setNewProduct({ ...newProduct, suiteId: e.target.value })}
                >
                  {suites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tier</label>
                <select 
                  className="form-control"
                  value={newProduct.tier}
                  onChange={(e) => setNewProduct({ ...newProduct, tier: e.target.value })}
                >
                  <option value="good">Good (Entry)</option>
                  <option value="better">Better (Standard)</option>
                  <option value="best">Best (Premium)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price ($/mo)</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="e.g. 29"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Target Vol</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="Target volume"
                  value={newProduct.targetSales}
                  onChange={(e) => setNewProduct({ ...newProduct, targetSales: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Weekly Vol</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="Current volume"
                  value={newProduct.weeklyVolume}
                  onChange={(e) => setNewProduct({ ...newProduct, weeklyVolume: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Last Wk Vol</label>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="Previous volume"
                  value={newProduct.lastWeekVolume}
                  onChange={(e) => setNewProduct({ ...newProduct, lastWeekVolume: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
              <Plus size={16} /> Add Product to Catalog
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
