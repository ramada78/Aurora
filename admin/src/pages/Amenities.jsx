import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader,
  X,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";
import { useTranslation } from "react-i18next";

const Amenities = () => {
  const { t, i18n } = useTranslation();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [amenityNameEn, setAmenityNameEn] = useState("");
  const [amenityNameAr, setAmenityNameAr] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/amenities?lang=${i18n.language}`);
      if (response.data.success) {
        setAmenities(response.data.amenities || []);
      } else {
        toast.error(t('amenities.messages.fetchError'));
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error(t('amenities.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = async (e) => {
    e.preventDefault();
    if (!amenityNameEn.trim() || !amenityNameAr.trim()) {
      toast.error(t('amenities.messages.fillAllFields'));
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.post(
        `${backendurl}/api/amenities`,
        { 
          nameEn: amenityNameEn.trim(),
          nameAr: amenityNameAr.trim()
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('amenities.messages.addSuccess'));
        setAmenityNameEn("");
        setAmenityNameAr("");
        setShowAddModal(false);
        fetchAmenities();
      } else {
        toast.error(response.data.message || t('amenities.messages.addError'));
      }
    } catch (error) {
      console.error("Error adding amenity:", error);
      toast.error(t('amenities.messages.addError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAmenity = async (e) => {
    e.preventDefault();
    if (!amenityNameEn.trim() || !amenityNameAr.trim()) {
      toast.error(t('amenities.messages.fillAllFields'));
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.put(
        `${backendurl}/api/amenities/${editingAmenity._id}`,
        { 
          nameEn: amenityNameEn.trim(),
          nameAr: amenityNameAr.trim()
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('amenities.messages.updateSuccess'));
        setAmenityNameEn("");
        setAmenityNameAr("");
        setEditingAmenity(null);
        fetchAmenities();
      } else {
        toast.error(response.data.message || t('amenities.messages.updateError'));
      }
    } catch (error) {
      console.error("Error updating amenity:", error);
      toast.error(t('amenities.messages.updateError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAmenity = async (amenityId) => {
    if (!window.confirm(t('amenities.messages.confirmDelete'))) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.delete(
        `${backendurl}/api/amenities/${amenityId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('amenities.messages.deleteSuccess'));
        fetchAmenities();
      } else {
        toast.error(response.data.message || t('amenities.messages.deleteError'));
      }
    } catch (error) {
      console.error("Error deleting amenity:", error);
      toast.error(t('amenities.messages.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (amenity) => {
    setEditingAmenity(amenity);
    setAmenityNameEn(amenity.name?.en || amenity.name || "");
    setAmenityNameAr(amenity.name?.ar || "");
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAmenity(null);
    setAmenityNameEn("");
    setAmenityNameAr("");
  };

  useEffect(() => {
    fetchAmenities();
  }, [i18n.language]); // Refetch when language changes

  const filteredAmenities = amenities.filter((amenity) =>
    amenity.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('amenities.loading')}</h3>
          <p className="text-gray-600">{t('amenities.loading')}</p>
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
              {t('amenities.title')}
            </h1>
            <p className="text-gray-600">
              {t('amenities.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('amenities.searchPlaceholder')}
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
              {t('amenities.actions.addAmenity')}
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
                    {t('amenities.table.amenityName')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('amenities.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAmenities.map((amenity) => (
                  <motion.tr
                    key={amenity._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900 text-sm">
                          {amenity.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(amenity)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200"
                          disabled={actionLoading}
                          title={t('amenities.actions.edit')}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteAmenity(amenity._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
                          disabled={actionLoading}
                          title={t('amenities.actions.delete')}
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

          {filteredAmenities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? t('amenities.noAmenitiesFiltered') : t('amenities.noAmenities')}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingAmenity) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingAmenity ? t('amenities.modal.editTitle') : t('amenities.modal.addTitle')}
            </h2>
            <form onSubmit={editingAmenity ? handleEditAmenity : handleAddAmenity}>
              <div className="space-y-6">
                {/* English Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('amenities.modal.amenityNameEn')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={amenityNameEn}
                    onChange={(e) => setAmenityNameEn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={t('amenities.modal.enterAmenityNameEn')}
                    required
                  />
                </div>
                
                {/* Arabic Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('amenities.modal.amenityNameAr')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={amenityNameAr}
                    onChange={(e) => setAmenityNameAr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={t('amenities.modal.enterAmenityNameAr')}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={actionLoading}
                >
                  {t('amenities.actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : editingAmenity ? (
                    t('amenities.actions.update')
                  ) : (
                    t('amenities.actions.add')
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

export default Amenities; 