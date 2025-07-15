import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const TABS = [
  { label: 'Transactions', key: 'transactions', endpoint: '/api/transactions' },
  { label: 'Sellers', key: 'sellers', endpoint: '/api/sellers' },
  { label: 'Agents', key: 'agents', endpoint: '/api/agents' },
  { label: 'Reviews', key: 'reviews', endpoint: '/api/reviews' },
];

const schemas = {
  transactions: [
    { name: 'transaction_date', label: 'Transaction Date', type: 'date', required: true },
    { name: 'sale_price', label: 'Sale Price', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'text', required: true },
    { name: 'property_id', label: 'Property', type: 'select', ref: 'properties', required: true },
    { name: 'seller_id', label: 'Seller', type: 'select', ref: 'sellers', required: true },
    { name: 'buyer_id', label: 'Buyer (Client)', type: 'select', ref: 'clients', required: true },
  ],
  sellers: [
    { name: 'full_name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone_number', label: 'Phone Number', type: 'text', required: true },
  ],
  agents: [
    { name: 'user_id', label: 'User', type: 'select', ref: 'users', required: true },
    { name: 'phone_number', label: 'Phone Number', type: 'text', required: true },
  ],
  reviews: [
    { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5, required: true },
    { name: 'comment', label: 'Comment', type: 'text', required: false },
    { name: 'property_id', label: 'Property', type: 'select', ref: 'properties', required: true },
    { name: 'agent_id', label: 'Agent', type: 'select', ref: 'agents', required: true },
    { name: 'client_id', label: 'Client', type: 'select', ref: 'clients', required: true },
  ],
};

const referenceEndpoints = {
  properties: '/api/properties',
  sellers: '/api/sellers',
  clients: '/api/clients',
  agents: '/api/agents',
  users: '/api/users',
};

function ManageData() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refs, setRefs] = useState({});
  const [modal, setModal] = useState({ open: false, type: '', record: null });
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch main data and references
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const tab = TABS.find(t => t.key === activeTab);
        const res = await axios.get(API_BASE + tab.endpoint);
        setData(res.data[activeTab] || res.data[activeTab + 's'] || res.data[activeTab] || res.data || []);
        // Fetch references
        const refsObj = {};
        const schema = schemas[activeTab];
        if (schema) {
          await Promise.all(schema.filter(f => f.type === 'select' && f.ref).map(async f => {
            const refRes = await axios.get(API_BASE + referenceEndpoints[f.ref]);
            // Try to guess the array key
            const arr = refRes.data[f.ref] || refRes.data[f.ref + 's'] || refRes.data[Object.keys(refRes.data)[0]] || refRes.data || [];
            refsObj[f.ref] = arr;
          }));
        }
        setRefs(refsObj);
      } catch (err) {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, modal.open === false]);

  // Helper to get display name for reference fields
  const getRefName = (ref, id) => {
    const arr = refs[ref] || [];
    const obj = arr.find(r => r._id === id);
    if (!obj) return id;
    return obj.full_name || obj.name || obj.title || obj.email || obj.phone_number || obj._id;
  };

  // Handle form input
  const handleFormChange = (e, field) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [field]: value }));
  };

  // Open Add/Edit modal
  const openFormModal = (type, record = null) => {
    setFormError('');
    if (type === 'edit' && record) {
      setForm({ ...record });
    } else {
      setForm({});
    }
    setModal({ open: true, type, record });
  };

  // Submit Add/Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    const schema = schemas[activeTab];
    // Validate required fields
    for (const f of schema) {
      if (f.required && !form[f.name]) {
        setFormError(`${f.label} is required.`);
        setActionLoading(false);
        return;
      }
    }
    try {
      const tab = TABS.find(t => t.key === activeTab);
      if (modal.type === 'add') {
        await axios.post(API_BASE + tab.endpoint, form);
      } else if (modal.type === 'edit') {
        await axios.put(API_BASE + tab.endpoint + '/' + (form._id || form.id), form);
      }
      setModal({ open: false, type: '', record: null });
    } catch (err) {
      setFormError('Failed to save.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const tab = TABS.find(t => t.key === activeTab);
      await axios.delete(API_BASE + tab.endpoint + '/' + (modal.record._id || modal.record.id));
      setModal({ open: false, type: '', record: null });
    } catch (err) {
      setFormError('Failed to delete.');
    } finally {
      setActionLoading(false);
    }
  };

  // Render dynamic form
  const renderForm = () => {
    const schema = schemas[activeTab];
    return (
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {schema.map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium mb-1">{f.label}{f.required && ' *'}</label>
            {f.type === 'select' && f.ref ? (
              <select
                className="w-full border rounded px-2 py-1"
                value={form[f.name] || ''}
                onChange={e => handleFormChange(e, f.name)}
                required={f.required}
              >
                <option value="">Select {f.label}</option>
                {(refs[f.ref] || []).map(opt => (
                  <option key={opt._id} value={opt._id}>{getRefName(f.ref, opt._id)}</option>
                ))}
              </select>
            ) : f.type === 'select' && f.options ? (
              <select
                className="w-full border rounded px-2 py-1"
                value={form[f.name] || ''}
                onChange={e => handleFormChange(e, f.name)}
                required={f.required}
              >
                <option value="">Select {f.label}</option>
                {f.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className="w-full border rounded px-2 py-1"
                type={f.type}
                min={f.min}
                max={f.max}
                value={form[f.name] || ''}
                onChange={e => handleFormChange(e, f.name)}
                required={f.required}
              />
            )}
          </div>
        ))}
        {formError && <div className="text-red-500 text-sm">{formError}</div>}
        <div className="flex justify-end space-x-2 mt-4">
          <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setModal({ open: false, type: '', record: null })}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    );
  };

  // Render modal
  const renderModal = () => {
    if (!modal.open) return null;
    const { type, record } = modal;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-lg">
          <h2 className="text-xl font-bold mb-4 capitalize">{type === 'add' ? 'Add' : type === 'edit' ? 'Edit' : type === 'delete' ? 'Delete' : 'View'} {activeTab.slice(0, -1)}</h2>
          {type === 'view' && (
            <pre className="bg-gray-100 p-2 rounded text-xs mb-4 max-h-60 overflow-auto">{JSON.stringify(record, null, 2)}</pre>
          )}
          {(type === 'add' || type === 'edit') && renderForm()}
          {type === 'delete' && (
            <>
              <div className="mb-4">Are you sure you want to delete this record?</div>
              {formError && <div className="text-red-500 text-sm mb-2">{formError}</div>}
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setModal({ open: false, type: '', record: null })}>Cancel</button>
                <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleDelete} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
              </div>
            </>
          )}
          {type === 'view' && (
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setModal({ open: false, type: '', record: null })}>Close</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render table
  const renderTable = () => {
    if (loading) return <div className="py-8 text-center">Loading...</div>;
    if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
    if (!data.length) return <div className="py-8 text-center text-gray-400">No data found.</div>;
    const columns = Object.keys(data[0] || {});
    return (
      <table className="min-w-full divide-y divide-gray-200 mt-4">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
            ))}
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row._id || row.id}>
              {columns.map((col, idx) => {
                // Find if this column is a reference
                const schema = schemas[activeTab] || [];
                const refField = schema.find(f => f.name === col && f.type === 'select' && f.ref);
                return (
                  <td key={idx} className="px-6 py-4 whitespace-nowrap">
                    {refField ? getRefName(refField.ref, row[col])
                      : typeof row[col] === 'boolean' ? (row[col] ? 'Yes' : 'No')
                      : typeof row[col] === 'object' && row[col] !== null ? JSON.stringify(row[col])
                      : row[col]}
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap">
                <button className="text-blue-600 hover:underline mr-2" onClick={() => setModal({ open: true, type: 'view', record: row })}>View</button>
                <button className="text-green-600 hover:underline mr-2" onClick={() => openFormModal('edit', row)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => setModal({ open: true, type: 'delete', record: row })}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Data</h1>
      <div className="flex space-x-4 border-b mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`py-2 px-4 -mb-px border-b-2 font-medium ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex justify-end mb-2">
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => openFormModal('add')}>Add {TABS.find(t => t.key === activeTab).label.slice(0, -1)}</button>
      </div>
      <div>{renderTable()}</div>
      {renderModal()}
    </div>
  );
}

export default ManageData; 