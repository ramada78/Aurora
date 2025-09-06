import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader,
  Eye,
  Star,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";
import { useTranslation } from "react-i18next";

const News = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    content_en: "",
    content_ar: "",
    excerpt_en: "",
    excerpt_ar: "",
    image: "",
    category: "real_estate",
    author: "",
    tags: "",
    status: "draft",
    featured: false,
  });

  const categories = [
    { value: "buying", label: t('news.categories.buying') },
    { value: "selling", label: t('news.categories.selling') },
    { value: "investment", label: t('news.categories.investment') },
    { value: "tips", label: t('news.categories.tips') },
    { value: "market_trends", label: t('news.categories.market_trends') },
    { value: "real_estate", label: t('news.categories.real_estate') },
  ];

  const statuses = [
    { value: "draft", label: t('news.status.draft'), color: "bg-gray-100 text-gray-800" },
    { value: "published", label: t('news.status.published'), color: "bg-green-100 text-green-800" },
    { value: "archived", label: t('news.status.archived'), color: "bg-red-100 text-red-800" },
  ];

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const response = await axios.get(`${backendurl}/api/news/admin/news`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNews(response.data.news || []);
      } else {
        toast.error(t('news.messages.fetchError'));
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error(t('news.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [i18n.language]);

  const handleAddNews = async (e) => {
    e.preventDefault();
    
    if (!formData.title_en.trim() || !formData.title_ar.trim() || 
        !formData.content_en.trim() || !formData.content_ar.trim() ||
        !formData.excerpt_en.trim() || !formData.excerpt_ar.trim() ||
        !formData.image.trim() || !formData.author.trim()) {
      toast.error(t('news.messages.fillAllFields'));
      return;
    }

    setActionLoading(true);

    try {
      const response = await axios.post(`${backendurl}/api/news/news`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success(t('news.messages.createSuccess'));
        setShowAddModal(false);
        resetForm();
        fetchNews();
      } else {
        toast.error(t('news.messages.createError'));
      }
    } catch (error) {
      console.error("Error creating news:", error);
      toast.error(t('news.messages.createError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNews = async (e) => {
    e.preventDefault();
    
    if (!formData.title_en.trim() || !formData.title_ar.trim() || 
        !formData.content_en.trim() || !formData.content_ar.trim() ||
        !formData.excerpt_en.trim() || !formData.excerpt_ar.trim() ||
        !formData.image.trim() || !formData.author.trim()) {
      toast.error(t('news.messages.fillAllFields'));
      return;
    }

    setActionLoading(true);

    try {
      const response = await axios.put(
        `${backendurl}/api/news/news/${editingNews._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        toast.success(t('news.messages.updateSuccess'));
        setEditingNews(null);
        resetForm();
        fetchNews();
      } else {
        toast.error(t('news.messages.updateError'));
      }
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error(t('news.messages.updateError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm(t('news.messages.deleteConfirm'))) return;

    try {
      const response = await axios.delete(`${backendurl}/api/news/news/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        toast.success(t('news.messages.deleteSuccess'));
        fetchNews();
      } else {
        toast.error(t('news.messages.deleteError'));
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error(t('news.messages.deleteError'));
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    
    // Ensure we have fallback values and handle nested objects properly
    const formDataToSet = {
      title_en: newsItem.title?.en || "",
      title_ar: newsItem.title?.ar || "",
      content_en: newsItem.content?.en || "",
      content_ar: newsItem.content?.ar || "",
      excerpt_en: newsItem.excerpt?.en || "",
      excerpt_ar: newsItem.excerpt?.ar || "",
      image: newsItem.image || "",
      category: newsItem.category || "real_estate",
      author: newsItem.author || "",
      tags: Array.isArray(newsItem.tags) ? newsItem.tags.join(", ") : (newsItem.tags || ""),
      status: newsItem.status || "draft",
      featured: Boolean(newsItem.featured),
    };
    
    setFormData(formDataToSet);
  };

  const resetForm = () => {
    setFormData({
      title_en: "",
      title_ar: "",
      content_en: "",
      content_ar: "",
      excerpt_en: "",
      excerpt_ar: "",
      image: "",
      category: "real_estate",
      author: "",
      tags: "",
      status: "draft",
      featured: false,
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingNews(null);
    resetForm();
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch = 
      (item.title?.en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.title?.ar || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content?.en || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content?.ar || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getLocalizedTitle = (newsItem) => {
    return i18n.language === 'ar' ? (newsItem.title?.ar || newsItem.title?.en) : (newsItem.title?.en || newsItem.title?.ar);
  };

  const getLocalizedExcerpt = (newsItem) => {
    return i18n.language === 'ar' ? (newsItem.excerpt?.ar || newsItem.excerpt?.en) : (newsItem.excerpt?.en || newsItem.excerpt?.ar);
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    return statuses.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800";
  };

  const getCategoryColor = (category) => {
    const colors = {
      buying: "bg-blue-100 text-blue-800",
      selling: "bg-green-100 text-green-800",
      investment: "bg-purple-100 text-purple-800",
      tips: "bg-yellow-100 text-yellow-800",
      market_trends: "bg-indigo-100 text-indigo-800",
      real_estate: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('news.loading')}</h3>
          <p className="text-gray-600">{t('news.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        {/* Header and Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('news.title')}
            </h1>
            <p className="text-gray-600">
              {t('news.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('news.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              {t('news.actions.addNews')}
            </button>
          </div>
        </motion.div>

        {/* Table */}
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
                    {t('news.table.title')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('news.table.excerpt')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('news.table.category')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('news.table.author')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('news.table.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('news.table.views')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('news.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredNews.map((newsItem) => (
                  <motion.tr
                    key={newsItem._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <span className="font-medium text-gray-900 text-sm block">
                            {getLocalizedTitle(newsItem)}
                          </span>
                          {newsItem.featured && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current inline ml-1" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                        {getLocalizedExcerpt(newsItem)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(newsItem.category)}`}>
                        {t(`news.categories.${newsItem.category}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{newsItem.author}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(newsItem.status)}`}>
                        {newsItem.status ? t(`news.status.${newsItem.status}`) : t('news.status.draft')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{newsItem.views || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(newsItem)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                          disabled={actionLoading}
                          title={t('news.actions.edit')}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(newsItem._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
                          disabled={actionLoading}
                          title={t('news.actions.delete')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? t('news.noNewsFiltered') : t('news.noNews')}
            </div>
          )}
        </motion.div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingNews) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingNews ? t('news.modal.editTitle') : t('news.modal.addTitle')}
            </h2>
            
            <form onSubmit={editingNews ? handleUpdateNews : handleAddNews}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* English Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.titleEn')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterTitleEn')}
                    required
                  />
                </div>

                {/* Arabic Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.titleAr')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterTitleAr')}
                    required
                  />
                </div>

                {/* English Content */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.contentEn')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content_en}
                    onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterContentEn')}
                    required
                  />
                </div>

                {/* Arabic Content */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.contentAr')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content_ar}
                    onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterContentAr')}
                    required
                  />
                </div>

                {/* English Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.excerptEn')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.excerpt_en}
                    onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterExcerptEn')}
                    required
                  />
                </div>

                {/* Arabic Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.excerptAr')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.excerpt_ar}
                    onChange={(e) => setFormData({ ...formData, excerpt_ar: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterExcerptAr')}
                    required
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.imageUrl')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterImageUrl')}
                    required
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.author')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder={t('news.modal.enterAuthor')}
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.category')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="">{t('news.modal.selectCategory')}</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.status')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="">{t('news.modal.selectStatus')}</option>
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('news.modal.tags')} ({t('news.modal.tagsHelp')})
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                    {t('news.modal.featured')}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={actionLoading}
                >
                  {t('news.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : editingNews ? (
                    t('news.actions.update')
                  ) : (
                    t('news.actions.add')
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

export default News;
