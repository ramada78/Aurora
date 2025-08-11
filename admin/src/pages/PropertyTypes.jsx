import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";
import { useTranslation } from "react-i18next";

const PropertyTypes = () => {
  const { t, i18n } = useTranslation();
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeNameEn, setTypeNameEn] = useState("");
  const [typeNameAr, setTypeNameAr] = useState("");
  const [category, setCategory] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const categories = ["Residential", "Commercial", "Land", "Industrial"];

  const fetchPropertyTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/property-types?lang=${i18n.language}`);
      if (response.data.success) {
        setPropertyTypes(response.data.types || []);
      } else {
        toast.error(t('propertyTypes.messages.fetchError'));
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
      toast.error(t('propertyTypes.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPropertyType = async (e) => {
    e.preventDefault();
    if (!typeNameEn.trim() || !typeNameAr.trim() || !category) {
      toast.error(t('propertyTypes.messages.fillAllFields'));
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.post(
        `${backendurl}/api/property-types`,
        {
          typeNameEn: typeNameEn.trim(),
          typeNameAr: typeNameAr.trim(),
          category: category,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('propertyTypes.messages.addSuccess'));
        setTypeNameEn("");
        setTypeNameAr("");
        setCategory("");
        setShowAddModal(false);
        fetchPropertyTypes();
      } else {
        toast.error(response.data.message || t('propertyTypes.messages.addError'));
      }
    } catch (error) {
      console.error("Error adding property type:", error);
      toast.error(t('propertyTypes.messages.addError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPropertyType = async (e) => {
    e.preventDefault();
    if (!typeNameEn.trim() || !typeNameAr.trim() || !category) {
      toast.error(t('propertyTypes.messages.fillAllFields'));
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.put(
        `${backendurl}/api/property-types/${editingType._id}`,
        {
          typeNameEn: typeNameEn.trim(),
          typeNameAr: typeNameAr.trim(),
          category: category,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('propertyTypes.messages.updateSuccess'));
        setTypeNameEn("");
        setTypeNameAr("");
        setCategory("");
        setEditingType(null);
        fetchPropertyTypes();
      } else {
        toast.error(response.data.message || t('propertyTypes.messages.updateError'));
      }
    } catch (error) {
      console.error("Error updating property type:", error);
      toast.error(t('propertyTypes.messages.updateError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePropertyType = async (typeId) => {
    if (!window.confirm(t('propertyTypes.messages.confirmDelete'))) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.delete(
        `${backendurl}/api/property-types/${typeId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('propertyTypes.messages.deleteSuccess'));
        fetchPropertyTypes();
      } else {
        toast.error(response.data.message || t('propertyTypes.messages.deleteError'));
      }
    } catch (error) {
      console.error("Error deleting property type:", error);
      toast.error(t('propertyTypes.messages.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (propertyType) => {
    setEditingType(propertyType);
    setTypeNameEn(propertyType.type_name?.en || propertyType.type_name || "");
    setTypeNameAr(propertyType.type_name?.ar || "");
    setCategory(propertyType.category);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingType(null);
    setTypeNameEn("");
    setTypeNameAr("");
    setCategory("");
  };

  useEffect(() => {
    fetchPropertyTypes();
  }, [i18n.language]); // Refetch when language changes

  const filteredPropertyTypes = propertyTypes.filter((type) =>
    type.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case "Residential":
        return "bg-blue-100 text-blue-800";
      case "Commercial":
        return "bg-green-100 text-green-800";
      case "Land":
        return "bg-yellow-100 text-yellow-800";
      case "Industrial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('propertyTypes.loading')}</h3>
          <p className="text-gray-600">{t('propertyTypes.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header and Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('propertyTypes.title')}
            </h1>
            <p className="text-gray-600">
              {t('propertyTypes.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('propertyTypes.searchPlaceholder')}
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
              {t('propertyTypes.actions.addPropertyType')}
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
                    {t('propertyTypes.table.typeName')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('propertyTypes.table.category')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('propertyTypes.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPropertyTypes.map((propertyType) => (
                  <motion.tr
                    key={propertyType._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900 text-sm">
                          {propertyType.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(propertyType.category)}`}>
                        {t(`propertyTypes.categories.${propertyType.category.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(propertyType)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                          disabled={actionLoading}
                          title={t('propertyTypes.actions.edit')}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePropertyType(propertyType._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
                          disabled={actionLoading}
                          title={t('propertyTypes.actions.delete')}
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

          {filteredPropertyTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? t('propertyTypes.noPropertyTypesFiltered') : t('propertyTypes.noPropertyTypes')}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingType) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingType ? t('propertyTypes.modal.editTitle') : t('propertyTypes.modal.addTitle')}
            </h2>
            <form onSubmit={editingType ? handleEditPropertyType : handleAddPropertyType}>
              <div className="space-y-6">
                {/* English Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('propertyTypes.modal.typeNameEn')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={typeNameEn}
                    onChange={(e) => setTypeNameEn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={t('propertyTypes.modal.enterTypeNameEn')}
                    required
                  />
                </div>
                
                {/* Arabic Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('propertyTypes.modal.typeNameAr')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={typeNameAr}
                    onChange={(e) => setTypeNameAr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={t('propertyTypes.modal.enterTypeNameAr')}
                    required
                  />
                </div>
                
                {/* Category Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('propertyTypes.modal.category')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900"
                    required
                  >
                    <option value="">{t('propertyTypes.modal.selectCategory')}</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`propertyTypes.categories.${cat.toLowerCase()}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={actionLoading}
                >
                  {t('propertyTypes.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : editingType ? (
                    t('propertyTypes.actions.update')
                  ) : (
                    t('propertyTypes.actions.add')
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

export default PropertyTypes; 