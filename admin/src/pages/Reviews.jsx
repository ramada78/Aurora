import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Star,
  Trash2,
  Search,
  Loader,
  Home,
  User,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";
import { useTranslation } from "react-i18next";

const Reviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/reviews`);
      if (response.data.success) {
        setReviews(response.data.reviews || []);
      } else {
        toast.error(t('reviews.messages.fetchError'));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error(t('reviews.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(t('reviews.actions.deleteConfirm'))) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.delete(
        `${backendurl}/api/reviews/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('reviews.messages.deleteSuccess'));
        fetchReviews();
      } else {
        toast.error(response.data.message || t('reviews.messages.deleteError'));
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(t('reviews.messages.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) =>
    review.property_id?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">{t('reviews.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        {/* Header and Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('reviews.title')}
              </h1>
              <p className="text-gray-600 text-lg">
                {t('reviews.subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('reviews.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>
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
                    {t('reviews.table.property')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('reviews.table.reviewer')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('reviews.table.rating')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('reviews.table.comment')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('reviews.table.date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('reviews.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <motion.tr
                    key={review._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {review.property_id?.title || t('reviews.labels.unknownProperty')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.property_id?.city?.city_name || t('reviews.labels.unknownLocation')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {review.user_id?.name || t('reviews.labels.anonymous')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {review.user_id?.email || t('reviews.labels.noEmail')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-xs text-gray-600">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start">
                        <MessageSquare className="w-3 h-3 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-900 max-w-xs truncate">
                          {review.comment || t('reviews.labels.noComment')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200"
                          disabled={actionLoading}
                          title={t('reviews.actions.delete')}
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

          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? t('reviews.noReviewsFiltered') : t('reviews.noReviews')}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Reviews; 