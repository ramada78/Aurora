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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);

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

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!formData.transaction_date || !formData.sale_price || !formData.status || 
        !formData.property_id || !formData.seller_id || !formData.buyer_id) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Prepare payload, set agent_id to null if empty
    const payload = { ...formData };
    if (payload.agent_id === "") payload.agent_id = null;
    try {
      setActionLoading(true);
      const response = await axios.post(
        `${backendurl}/api/transactions`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Transaction added successfully");
        resetForm();
        setShowAddModal(false);
        fetchTransactions();
      } else {
        toast.error(response.data.message || "Failed to add transaction");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTransaction = async (e) => {
    e.preventDefault();
    if (!formData.transaction_date || !formData.sale_price || !formData.status || 
        !formData.property_id || !formData.seller_id || !formData.buyer_id) {
      toast.error("Please fill in all required fields");
      return;
    }
    // Prepare payload, set agent_id to null if empty
    const payload = { ...formData };
    if (payload.agent_id === "") payload.agent_id = null;
    try {
      setActionLoading(true);
      const response = await axios.put(
        `${backendurl}/api/transactions/${editingTransaction._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Transaction updated successfully");
        resetForm();
        setEditingTransaction(null);
        fetchTransactions();
      } else {
        toast.error(response.data.message || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.delete(
        `${backendurl}/api/transactions/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Transaction deleted successfully");
        fetchTransactions();
      } else {
        toast.error(response.data.message || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      transaction_date: transaction.transaction_date
        ? (() => {
            const d = new Date(transaction.transaction_date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().slice(0, 16);
          })()
        : "",
      sale_price: transaction.sale_price || "",
      status: transaction.status || "",
      deal_type: transaction.deal_type || "",
      property_id: transaction.property_id?._id || transaction.property_id || "",
      seller_id: transaction.seller_id?._id || transaction.seller_id || "",
      buyer_id: transaction.buyer_id?._id || transaction.buyer_id || "",
      agent_id: transaction.agent_id?._id || transaction.agent_id || "",
    });
  };

  const resetForm = () => {
    setFormData({
      transaction_date: "",
      sale_price: "",
      status: "",
      deal_type: "",
      property_id: "",
      seller_id: "",
      buyer_id: "",
      agent_id: "",
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
    resetForm();
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
      seller_id: selectedProperty?.seller?._id || "",
      agent_id: selectedProperty?.agent?._id || "",
    }));
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

  useEffect(() => {
    fetchTransactions();
    fetchReferenceData();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const property = properties.find(p => p._id === (transaction.property_id?._id || transaction.property_id));
    const seller = sellers.find(s => s._id === (transaction.seller_id?._id || transaction.seller_id));
    const client = clients.find(c => c._id === (transaction.buyer_id?._id || transaction.buyer_id));
    const agent = agents.find(a => a._id === (transaction.agent_id?._id || transaction.agent_id));

    const propertyTitle = property?.title?.toLowerCase() || "";
    const sellerName = seller?.full_name?.toLowerCase() || "";
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
                {filteredTransactions.map((transaction) => (
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
                            {(() => {
                              const property = properties.find(p => p._id === (transaction.property_id?._id || transaction.property_id));
                              return property ? `${property.title} - ${property.city?.city_name || ''}` : 'N/A';
                            })()}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Seller */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {(() => {
                              const seller = sellers.find(s => s._id === (transaction.seller_id?._id || transaction.seller_id));
                              return seller ? seller.full_name : 'N/A';
                            })()}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Buyer */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {(() => {
                              const client = clients.find(c => c._id === (transaction.buyer_id?._id || transaction.buyer_id));
                              return client ? (client.user_id?.name || 'N/A') : 'N/A';
                            })()}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Agent */}
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {(() => {
                              if (!transaction.agent_id) return '—';
                              const agentId = transaction.agent_id?._id || transaction.agent_id;
                              const agent = agents.find(a => a._id === agentId);
                              return agent ? (agent.user_id?.name || 'N/A') : 'N/A';
                            })()}
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
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          disabled={actionLoading}
                          title="Edit transaction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          disabled={actionLoading}
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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

      {/* Add/Edit Modal */}
      {(showAddModal || editingTransaction) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
            </h2>
            <form onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price of Sale / Monthly Rent *
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter sale price"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Type *
                  </label>
                  <select
                    name="deal_type"
                    value={formData.deal_type}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select deal type</option>
                    <option value="sale">Sale</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property *
                  </label>
                  <select
                    name="property_id"
                    value={formData.property_id}
                    onChange={handlePropertyChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller *
                  </label>
                  <select
                    name="seller_id"
                    value={formData.seller_id}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select seller</option>
                    {sellers.map((seller) => (
                      <option key={seller._id} value={seller._id}>
                        {seller.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer (Client) *
                  </label>
                  <select
                    name="buyer_id"
                    value={formData.buyer_id}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select buyer</option>
                    {clients
                      .filter(client => client.user_id && typeof client.user_id === 'object' && client.user_id.name)
                      .reduce((unique, client) => {
                        if (!unique.some(c => c.user_id._id === client.user_id._id)) unique.push(client);
                        return unique;
                      }, [])
                      .map(client => (
                        <option key={client._id} value={client._id}>
                          {client.user_id.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent
                  </label>
                  <select
                    name="agent_id"
                    value={formData.agent_id}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select agent</option>
                    {agents
                      .filter(agent => agent.user_id && typeof agent.user_id === 'object' && agent.user_id.name)
                      .reduce((unique, agent) => {
                        if (!unique.some(a => a.user_id._id === agent.user_id._id)) unique.push(agent);
                        return unique;
                      }, [])
                      .map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.user_id.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : editingTransaction ? (
                    "Update"
                  ) : (
                    "Add"
                  )}
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