import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  DollarSign,
  User,
  Home,
  Check,
  X,
  Loader,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    transaction_date: '',
    sale_price: '',
    status: '',
    deal_type: '',
    property_id: '',
    seller_id: '',
    agent_id: '',
    buyer_id: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    transaction_date: "",
    sale_price: "",
    status: "",
    deal_type: "",
    property_id: "",
    seller_id: "",
    buyer_id: "",
    agent_id: "",
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/transactions`);
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      } else {
        toast.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [propertiesRes, sellersRes, clientsRes, agentsRes] = await Promise.all([
        axios.get(`${backendurl}/api/products/list`),
        axios.get(`${backendurl}/api/sellers`),
        axios.get(`${backendurl}/api/clients`),
        axios.get(`${backendurl}/api/agents`),
      ]);

      setProperties(propertiesRes.data.property || propertiesRes.data.properties || []);
      setSellers(sellersRes.data.sellers || []);
      setClients(clientsRes.data.clients || []);
      setAgents(agentsRes.data.agents || []);
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    const selectedProperty = properties.find(p => p._id === propertyId);
    setFormData(prev => ({
      ...prev,
      property_id: propertyId,
      seller_id: selectedProperty?.seller || undefined,
      agent_id: selectedProperty?.agent || undefined,
    }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    // Auto-fill seller/agent when property changes
    if (name === 'property_id') {
      const selectedProperty = properties.find(p => p._id === value);
      setAddForm((prev) => ({
        ...prev,
        property_id: value,
        seller_id: selectedProperty?.seller ? String(selectedProperty.seller) : '',
        agent_id: selectedProperty?.agent ? String(selectedProperty.agent) : '',
      }));
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!addForm.transaction_date || !addForm.sale_price || !addForm.status || !addForm.deal_type || !addForm.property_id || !addForm.seller_id || !addForm.buyer_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    // Always send string IDs in the payload
    const payload = {
      ...addForm,
      property_id: String(addForm.property_id),
      seller_id: String(addForm.seller_id),
      agent_id: addForm.agent_id ? String(addForm.agent_id) : undefined,
      buyer_id: String(addForm.buyer_id),
      sale_price: Number(addForm.sale_price),
    };
    if (!payload.agent_id) delete payload.agent_id;
    setAddLoading(true);
    try {
      const response = await axios.post(`${backendurl}/api/transactions`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.data.success) {
        toast.success('Transaction added successfully');
        setShowAddModal(false);
        setAddForm({ transaction_date: '', sale_price: '', status: '', deal_type: '', property_id: '', seller_id: '', agent_id: '', buyer_id: '' });
        fetchTransactions();
      } else {
        toast.error(response.data.message || 'Failed to add transaction');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await axios.delete(`${backendurl}/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleEditClick = (transaction) => {
    setEditForm({
      ...transaction,
      property_id: safeGetId(transaction.property_id),
      seller_id: safeGetId(transaction.seller_id),
      agent_id: safeGetId(transaction.agent_id),
      buyer_id: safeGetId(transaction.buyer_id),
      transaction_date: formatDateForInput(transaction.transaction_date),
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditTransaction = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        ...editForm,
        property_id: String(editForm.property_id),
        seller_id: String(editForm.seller_id),
        agent_id: editForm.agent_id ? String(editForm.agent_id) : undefined,
        buyer_id: String(editForm.buyer_id),
        sale_price: Number(editForm.sale_price),
      };
      if (!payload.agent_id) delete payload.agent_id;
      await axios.put(`${backendurl}/api/transactions/${editForm._id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      toast.success('Transaction updated');
      setShowEditModal(false);
      setEditForm(null);
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    } finally {
      setEditLoading(false);
    }
  };

  const getReferenceName = (id, referenceArray, nameField = 'name') => {
    const item = referenceArray.find(item => item._id === id);
    return item ? (item[nameField] || item.title || item.full_name || item.email) : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Utility function to safely extract an _id
  function safeGetId(obj) {
    return obj && typeof obj === 'object' && obj._id ? obj._id : obj ? String(obj) : '';
  }

  // Utility function to format date for datetime-local input
  function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    fetchTransactions();
    fetchReferenceData();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const propertyId = transaction.property_id && typeof transaction.property_id === 'object'
      ? transaction.property_id._id
      : transaction.property_id;
    const sellerId = transaction.seller_id && typeof transaction.seller_id === 'object'
      ? transaction.seller_id._id
      : transaction.seller_id;
    const buyerId = transaction.buyer_id && typeof transaction.buyer_id === 'object'
      ? transaction.buyer_id._id
      : transaction.buyer_id;
    const agentId = transaction.agent_id && typeof transaction.agent_id === 'object'
      ? transaction.agent_id._id
      : transaction.agent_id;

    const property = properties.find(p => p._id === propertyId);
    const seller = sellers.find(s => s._id === sellerId);
    const client = clients.find(c => c._id === buyerId);
    const agent = agents.find(a => a._id === agentId);

    const propertyTitle = property?.title?.toLowerCase() || "";
    const sellerName = seller?.user_id?.name?.toLowerCase() || "";
    const buyerName = client?.user_id?.name?.toLowerCase() || "";
    const agentName = agent?.user_id?.name?.toLowerCase() || "";

    const search = searchTerm.toLowerCase();

    return (
      search === "" ||
      propertyTitle.includes(search) ||
      sellerName.includes(search) ||
      buyerName.includes(search) ||
      agentName.includes(search)
    );
  });

  // Get current user and roles
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');

  // Filter properties for transaction creation
  const myProperties = properties.filter(property => {
    if (user.isAdmin) return true;
    if (!user._id) return false;
    return (
      (property.agent && (property.agent._id === user._id || property.agent === user._id)) ||
      (property.seller && (property.seller._id === user._id || property.seller === user._id))
    );
  });

  // Add diagnostic logging at the top of the component render
  console.log('sellers:', sellers);
  console.log('agents:', agents);
  console.log('transactions:', transactions);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header and Search Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Transactions</h1>
            <p className="text-gray-600">
              Manage and track property sale transactions
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => {
                  let seller = sellers.find(c => safeGetId(c.user_id) === safeGetId(transaction.seller_id));
                  if (!seller) seller = sellers.find(s => s.user_id && s.user_id._id === String(transaction.seller_id));
                  let agent = agents.find(a => a.user_id && a.user_id._id === String(transaction.agent_id));
                  if (!agent) agent = agents.find(a => a.user_id && a.user_id._id === String(transaction.agent_id));
                  const property = properties.find(p => safeGetId(p._id) === safeGetId(transaction.property_id));
                  const client = clients.find(c => safeGetId(c._id) === safeGetId(transaction.buyer_id));
                  return (
                  <motion.tr
                    key={transaction._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Property */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center">
                        <Home className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                              {property ? `${property.title} - ${property.city?.city_name || ''}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                      {/* Seller (show user name) */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                              {seller ? `${seller.user_id.name}` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                      {/* Buyer (show user name) */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                              {client && client.user_id && client.user_id.name ? client.user_id.name : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                      {/* Agent (show user name) */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                              {transaction.agent_id && transaction.agent_id.name ? transaction.agent_id.name : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Deal Type */}
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                        {transaction.deal_type ? transaction.deal_type.charAt(0).toUpperCase() + transaction.deal_type.slice(1) : 'N/A'}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-6 py-4 text-xs">
                      {transaction.transaction_date ? (() => {
                        const d = new Date(transaction.transaction_date);
                        // Format: YYYY-MM-DD HH:mm (no seconds)
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        const hours = String(d.getHours()).padStart(2, '0');
                        const minutes = String(d.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day} ${hours}:${minutes}`;
                      })() : 'N/A'}
                    </td>
                    {/* Price */}
                    <td className="px-6 py-4 text-xs">
                      {transaction.sale_price ? `$${transaction.sale_price.toLocaleString()}` : 'N/A'}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-2">
                          <button onClick={() => handleEditClick(transaction)} className="p-1 rounded hover:bg-gray-200">
                            <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                          <button onClick={() => handleDeleteTransaction(transaction._id)} className="p-1 rounded hover:bg-gray-200">
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filter !== "all" ? "No transactions found matching your criteria" : "No transactions found"}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
            <form onSubmit={handleAddTransaction}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date *</label>
                  <input
                    type="datetime-local"
                    name="transaction_date"
                    value={addForm.transaction_date}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price of Sale / Monthly Rent *</label>
                  <input
                    type="number"
                    name="sale_price"
                    value={addForm.sale_price}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter sale price"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={addForm.status}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type *</label>
                  <select
                    name="deal_type"
                    value={addForm.deal_type}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select deal type</option>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property *</label>
                  <select
                    name="property_id"
                    value={addForm.property_id}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select property</option>
                    {myProperties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.title} - {property.city?.city_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seller</label>
                  <select
                    name="seller_id"
                    value={addForm.seller_id}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Seller</option>
                    {sellers
                      .filter(seller => seller && seller.user_id && typeof seller.user_id === 'object' && seller.user_id.name && seller.user_id._id)
                      .reduce((unique, seller) => {
                        if (!unique.some(c => c.user_id && c.user_id._id === seller.user_id._id)) unique.push(seller);
                        return unique;
                      }, [])
                      .map(seller => (
                        <option key={seller.user_id._id} value={seller.user_id._id}>
                          {seller.user_id.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
                  <select
                    name="agent_id"
                    value={addForm.agent_id}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Agent</option>
                    {agents
                      .filter(agent => agent && agent.user_id && typeof agent.user_id === 'object' && agent.user_id.name && agent.user_id._id)
                      .reduce((unique, agent) => {
                        if (!unique.some(c => c.user_id && c.user_id._id === agent.user_id._id)) unique.push(agent);
                        return unique;
                      }, [])
                      .map(agent => (
                        <option key={agent.user_id._id} value={agent.user_id._id}>
                          {agent.user_id.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buyer (Client) *</label>
                  <select
                    name="buyer_id"
                    value={addForm.buyer_id}
                    onChange={handleAddFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select buyer</option>
                    {(() => {
                      const filteredClients = clients
                        .filter(client => client && client.user_id && typeof client.user_id === 'object' && client.user_id.name && client.user_id._id);
                      filteredClients.forEach(client => console.log('client in dropdown:', client));
                      return filteredClients
                        .reduce((unique, client) => {
                          if (!unique.some(c => c.user_id && c.user_id._id === client.user_id._id)) unique.push(client);
                          return unique;
                        }, [])
                        .map(client => (
                          <option key={client._id} value={client._id}>
                            {client.user_id.name}
                          </option>
                        ));
                    })()}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={addLoading}
                >
                  {addLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
            <form onSubmit={handleEditTransaction}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date *</label>
                  <input
                    type="datetime-local"
                    name="transaction_date"
                    value={formatDateForInput(editForm.transaction_date)}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price of Sale / Monthly Rent *</label>
                  <input
                    type="number"
                    name="sale_price"
                    value={editForm.sale_price}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter sale price"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deal Type *</label>
                  <select
                    name="deal_type"
                    value={editForm.deal_type}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select deal type</option>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property *</label>
                  <select
                    name="property_id"
                    value={editForm.property_id}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select property</option>
                    {properties.map((property) => (
                      <option key={property._id} value={property._id}>
                        {property.title} - {property.city?.city_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seller</label>
                  <select
                    name="seller_id"
                    value={editForm.seller_id}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Seller</option>
                    {sellers
                      .filter(seller => seller && seller.user_id && typeof seller.user_id === 'object' && seller.user_id.name && seller.user_id._id)
                      .reduce((unique, seller) => {
                        if (!unique.some(c => c.user_id && c.user_id._id === seller.user_id._id)) unique.push(seller);
                        return unique;
                      }, [])
                      .map(seller => (
                        <option key={seller.user_id._id} value={seller.user_id._id}>
                          {seller.user_id.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
                  <select
                    name="agent_id"
                    value={editForm.agent_id}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Agent</option>
                    {agents
                      .filter(agent => agent && agent.user_id && typeof agent.user_id === 'object' && agent.user_id.name && agent.user_id._id)
                      .reduce((unique, agent) => {
                        if (!unique.some(c => c.user_id && c.user_id._id === agent.user_id._id)) unique.push(agent);
                        return unique;
                      }, [])
                      .map(agent => (
                        <option key={agent.user_id._id} value={agent.user_id._id}>
                          {agent.user_id.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buyer (Client) *</label>
                  <select
                    name="buyer_id"
                    value={editForm.buyer_id}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select buyer</option>
                    {clients
                      .filter(client => client && client.user_id && typeof client.user_id === 'object' && client.user_id.name && client.user_id._id)
                      .reduce((unique, client) => {
                        if (!unique.some(c => c.user_id && c.user_id._id === client.user_id._id)) unique.push(client);
                        return unique;
                      }, [])
                      .map(client => (
                        <option key={client._id} value={client._id}>
                          {client.user_id.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions; 