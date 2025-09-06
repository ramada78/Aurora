import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Reply,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Tag,
  UserCheck,
  BarChart3,
  RefreshCw,
  Loader,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";
import { useTranslation } from "react-i18next";

const Forms = () => {
  const { t, i18n } = useTranslation();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Selected form for detail view
  const [selectedForm, setSelectedForm] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  
  // Reply form
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const statuses = [
    { value: "new", label: t('formsManagement.status.new'), color: "bg-blue-100 text-blue-800", icon: MessageCircle },
    { value: "read", label: t('formsManagement.status.read'), color: "bg-yellow-100 text-yellow-800", icon: Eye },
    { value: "replied", label: t('formsManagement.status.replied'), color: "bg-green-100 text-green-800", icon: CheckCircle },
    { value: "closed", label: t('formsManagement.status.closed'), color: "bg-gray-100 text-gray-800", icon: XCircle },
  ];

  const priorities = [
    { value: "low", label: t('formsManagement.priority.low'), color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: t('formsManagement.priority.medium'), color: "bg-blue-100 text-blue-800" },
    { value: "high", label: t('formsManagement.priority.high'), color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: t('formsManagement.priority.urgent'), color: "bg-red-100 text-red-800" },
  ];


  const fetchForms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const response = await axios.get(`${backendurl}/api/forms/admin?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setForms(response.data.forms || []);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      } else {
        toast.error(t('formsManagement.messages.fetchError'));
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error(t('formsManagement.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendurl}/api/forms/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchForms();
    fetchStats();
  }, [currentPage, statusFilter, priorityFilter, searchTerm]);

  const handleStatusChange = async (formId, newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${backendurl}/api/forms/admin/${formId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(t('formsManagement.messages.statusUpdated'));
        fetchForms();
        fetchStats();
      } else {
        toast.error(t('formsManagement.messages.updateError'));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t('formsManagement.messages.updateError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (formId, newPriority) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${backendurl}/api/forms/admin/${formId}`,
        { priority: newPriority },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(t('formsManagement.messages.priorityUpdated'));
        fetchForms();
      } else {
        toast.error(t('formsManagement.messages.updateError'));
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error(t('formsManagement.messages.updateError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!window.confirm(t('formsManagement.messages.deleteConfirm'))) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(`${backendurl}/api/forms/admin/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(t('formsManagement.messages.deleteSuccess'));
        fetchForms();
        fetchStats();
      } else {
        toast.error(t('formsManagement.messages.deleteError'));
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error(t('formsManagement.messages.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewForm = async (formId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendurl}/api/forms/admin/${formId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedForm(response.data.form);
        setShowDetailModal(true);
        
        // Mark as read if it's new
        if (response.data.form.status === 'new') {
          handleStatusChange(formId, 'read');
        }
      } else {
        toast.error(t('formsManagement.messages.fetchError'));
      }
    } catch (error) {
      console.error("Error fetching form details:", error);
      toast.error(t('formsManagement.messages.fetchError'));
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error(t('formsManagement.messages.replyRequired'));
      return;
    }

    try {
      setReplyLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${backendurl}/api/forms/admin/${selectedForm._id}/reply`,
        { message: replyMessage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(t('formsManagement.messages.replySent'));
        setReplyMessage("");
        setShowReplyModal(false);
        fetchForms();
        fetchStats();
        
        // Update selected form with new reply
        setSelectedForm(response.data.form);
      } else {
        toast.error(t('formsManagement.messages.replyError'));
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error(t('formsManagement.messages.replyError'));
    } finally {
      setReplyLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-SY' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.icon : MessageCircle;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return AlertCircle;
      case 'high': return AlertCircle;
      case 'medium': return Clock;
      case 'low': return Clock;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('formsManagement.loading')}</h3>
          <p className="text-gray-600">{t('formsManagement.loadingSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('formsManagement.title')}
            </h1>
            <p className="text-gray-600">
              {t('formsManagement.subtitle')} ({totalItems} {t('formsManagement.totalForms')})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { fetchForms(); fetchStats(); }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              {t('formsManagement.refresh')}
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('formsManagement.stats.total')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('formsManagement.stats.new')}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('formsManagement.stats.replied')}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('formsManagement.stats.urgent')}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t('formsManagement.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <Filter className="w-5 h-5" />
              {t('filters')}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('formsManagement.filters.status')}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t('formsManagement.filters.allStatuses')}</option>
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('formsManagement.filters.priority')}
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">{t('formsManagement.filters.allPriorities')}</option>
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Forms Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('formsManagement.table.contact')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('formsManagement.table.message')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('formsManagement.table.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('formsManagement.table.priority')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('formsManagement.table.date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('formsManagement.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {forms.map((form) => {
                  const StatusIcon = getStatusIcon(form.status);
                  const PriorityIcon = getPriorityIcon(form.priority);
                  
                  return (
                    <motion.tr
                      key={form._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`hover:bg-gray-50 ${form.status === 'new' ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{form.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {form.email}
                            </div>
                            {form.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {form.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <p className="line-clamp-2">{form.message}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <StatusIcon className="w-4 h-4 mr-2" />
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statuses.find(s => s.value === form.status)?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statuses.find(s => s.value === form.status)?.label || form.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <PriorityIcon className="w-4 h-4 mr-2" />
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${priorities.find(p => p.value === form.priority)?.color || 'bg-gray-100 text-gray-800'}`}>
                            {priorities.find(p => p.value === form.priority)?.label || form.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(form.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewForm(form._id)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                            title={t('formsManagement.actions.view')}
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedForm(form);
                              setShowReplyModal(true);
                            }}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-all duration-200"
                            title={t('formsManagement.actions.reply')}
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form._id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
                            disabled={actionLoading}
                            title={t('formsManagement.actions.delete')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {forms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? t('formsManagement.noFormsFiltered') 
                : t('formsManagement.noForms')
              }
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('formsManagement.previous')}
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              {t('formsManagement.page')} {currentPage} {t('formsManagement.of')} {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('formsManagement.next')}
            </button>
          </motion.div>
        )}

      {/* Form Detail Modal */}
      {showDetailModal && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('formsManagement.detail.title')}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('formsManagement.detail.contactInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('formsManagement.detail.name')}</p>
                      <p className="font-medium text-gray-900">{selectedForm.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('formsManagement.detail.email')}</p>
                      <p className="font-medium text-gray-900">{selectedForm.email}</p>
                    </div>
                  </div>
                  {selectedForm.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">{t('formsManagement.detail.phone')}</p>
                        <p className="font-medium text-gray-900">{selectedForm.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('formsManagement.detail.date')}</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedForm.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('formsManagement.detail.message')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedForm.message}</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('formsManagement.detail.status')}</h3>
                  <select
                    value={selectedForm.status}
                    onChange={(e) => {
                      handleStatusChange(selectedForm._id, e.target.value);
                      setSelectedForm({...selectedForm, status: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={actionLoading}
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('formsManagement.detail.priority')}</h3>
                  <select
                    value={selectedForm.priority}
                    onChange={(e) => {
                      handlePriorityChange(selectedForm._id, e.target.value);
                      setSelectedForm({...selectedForm, priority: e.target.value});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={actionLoading}
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Replies */}
              {selectedForm.replies && selectedForm.replies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('formsManagement.detail.replies')}</h3>
                  <div className="space-y-3">
                    {selectedForm.replies.map((reply, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <UserCheck className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium text-gray-900">
                              {reply.repliedBy?.name || t('formsManagement.detail.admin')}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(reply.repliedAt)}
                          </span>
                        </div>
                        <p className="text-gray-900 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowReplyModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  {t('formsManagement.actions.reply')}
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('formsManagement.actions.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('formsManagement.reply.title')}
              </h2>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleReply}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('formsManagement.reply.message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder={t('formsManagement.reply.placeholder')}
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={replyLoading}
                >
                  {t('formsManagement.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  disabled={replyLoading}
                >
                  {replyLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Reply className="w-4 h-4" />
                      {t('formsManagement.actions.sendReply')}
                    </>
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

export default Forms;
