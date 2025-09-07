import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Home,
  Check,
  X,
  Loader,
  Filter,
  Search,
  Link as LinkIcon,
  Send,
  Pencil,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";

const Appointments = () => {
  const { t, i18n } = useTranslation();
  
  const VISIT_TYPES = [
    { value: "property", label: t('appointments.visitTypes.property') },
    { value: "online", label: t('appointments.visitTypes.online') },
    { value: "office_vr", label: t('appointments.visitTypes.office_vr') },
  ];
const VR_CITIES = [
  "Damascus", "Aleppo", "Homs", "Hama", "Latakia", "Tartus", "Daraa", "Sweida", "Quneitra", "Idlib", "Raqqa", "Deir ez-Zor", "Hasakah", "Rif Dimashq"
];
const MEETING_PLATFORMS = ["zoom", "google-meet", "teams", "other"];

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMeetingLink, setEditingMeetingLink] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  
  // Get current user info for filtering
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isAdmin = user.isAdmin;

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin by trying admin endpoint first
      let response;
      try {
        response = await axios.get(`${backendurl}/api/admin/appointments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } catch (adminError) {
        // If admin endpoint fails (401), try regular endpoint
        if (adminError.response?.status === 401) {
          response = await axios.get(`${backendurl}/api/appointments/all`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
        } else {
          throw adminError;
        }
      }

      if (response.data.success) {
        // Filter out appointments with missing user data
        let validAppointments = response.data.appointments.filter(
          (apt) => apt.userId && apt.propertyId
        );

        // Use the user info from component state

        // If not admin, filter appointments based on user role
        if (!isAdmin) {
          validAppointments = validAppointments.filter((apt) => {
            // For sellers: show only appointments for their properties
            if (roles.includes('seller')) {
              return apt.propertyId.seller && 
                     (apt.propertyId.seller._id === user._id || apt.propertyId.seller === user._id);
            }
            
            // For agents: show only appointments for properties they're assigned to
            if (roles.includes('agent')) {
              return apt.propertyId.agent && 
                     (apt.propertyId.agent._id === user._id || apt.propertyId.agent === user._id);
            }
            
            // For other roles, show all appointments (fallback)
            return true;
          });
        }

        setAppointments(validAppointments);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(t('appointments.messages.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      // Try admin endpoint first, fallback to regular endpoint
      let response;
      try {
        response = await axios.put(
          `${backendurl}/api/admin/appointments/status`,
          {
            appointmentId,
            status: newStatus,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
      } catch (adminError) {
        if (adminError.response?.status === 401) {
          response = await axios.put(
            `${backendurl}/api/appointments/status`,
            {
              appointmentId,
              status: newStatus,
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
        } else {
          throw adminError;
        }
      }

      if (response.data.success) {
        // Use the backend message if available, otherwise fall back to translation
        const successMessage = response.data.messageAr || response.data.message || t('appointments.messages.statusUpdateSuccess', { status: newStatus });
        toast.success(successMessage);
        fetchAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      const errorMessage = error.response?.data?.messageAr || error.response?.data?.message || t('appointments.messages.statusUpdateError');
      toast.error(errorMessage);
    }
  };

  const handleMeetingLinkUpdate = async (appointmentId) => {
    try {
      if (!meetingLink) {
        toast.error(t('appointments.messages.meetingLinkError'));
        return;
      }

      // Try admin endpoint first, fallback to regular endpoint
      let response;
      try {
        response = await axios.put(
          `${backendurl}/api/admin/appointments/update-meeting`,
          {
            appointmentId,
            meetingLink,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
      } catch (adminError) {
        if (adminError.response?.status === 401) {
          response = await axios.put(
            `${backendurl}/api/appointments/update-meeting`,
            {
              appointmentId,
              meetingLink,
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );
        } else {
          throw adminError;
        }
      }

      if (response.data.success) {
        toast.success(t('appointments.messages.meetingLinkSuccess'));
        setEditingMeetingLink(null);
        setMeetingLink("");
        fetchAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating meeting link:", error);
      toast.error(t('appointments.messages.meetingLinkUpdateError'));
    }
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setEditForm({
      appointmentId: appointment._id,
      propertyId: appointment.propertyId?._id || appointment.propertyId,
      date: appointment.date ? appointment.date.slice(0, 10) : "",
      time: appointment.time || "",
      notes: appointment.notes || "",
      visitType: appointment.visitType || "property",
      vrCity: appointment.vrCity || "",
      meetingPlatform: appointment.meetingPlatform || "other",
      meetingLink: appointment.meetingLink || "",
      status: appointment.status || "pending",
    });
  };
  const closeEditModal = () => {
    setEditingAppointment(null);
    setEditForm({});
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      // Try admin endpoint first, fallback to regular endpoint
      let response;
      try {
        response = await axios.put(
          `${backendurl}/api/admin/appointments/update-details`,
          editForm,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (adminError) {
        if (adminError.response?.status === 401) {
          response = await axios.put(
            `${backendurl}/api/appointments/update-details`,
            editForm,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
        } else {
          throw adminError;
        }
      }
      if (response.data.success) {
        // Use the backend message if available, otherwise fall back to translation
        const successMessage = response.data.messageAr || response.data.message || t('appointments.messages.editSuccess');
        toast.success(successMessage);
        closeEditModal();
        fetchAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        const errorMessage = error.response.data?.messageAr || error.response.data?.message || "You do not have permission to edit this appointment.";
        toast.error(errorMessage);
      } else {
        toast.error(t('appointments.messages.editError'));
      }
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchTerm === "" ||
      (apt.propertyId?.title ? 
        (i18n.language === 'ar' ? apt.propertyId.title.ar : apt.propertyId.title.en) || 
        apt.propertyId.title.en || '' : ''
      ).toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || apt.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Appointments</h3>
          <p className="text-gray-600">{t('appointments.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Show info message for non-admin users */}
      {!isAdmin && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                {roles.includes('seller') && t('appointments.messages.sellerViewInfo')}
                {roles.includes('agent') && t('appointments.messages.agentViewInfo')}
                {!roles.includes('seller') && !roles.includes('agent') && t('appointments.messages.userViewInfo')}
              </p>
            </div>
          </div>
        </div>
      )}
        {/* Header and Search Section - Keep existing code */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('appointments.title')}
            </h1>
            <p className="text-gray-600">
              {t('appointments.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('appointments.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">{t('appointments.filters.allAppointments')}</option>
                <option value="pending">{t('appointments.filters.pending')}</option>
                <option value="confirmed">{t('appointments.filters.confirmed')}</option>
                <option value="cancelled">{t('appointments.filters.cancelled')}</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('appointments.table.property')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('appointments.table.client')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('appointments.table.dateTime')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('appointments.table.status')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('appointments.table.visitType')}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('appointments.table.vrCity')}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('appointments.table.meetingLink')}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('appointments.table.cancelReason')}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {t('appointments.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <motion.tr
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Property Details */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {(i18n.language === 'ar' ? appointment.propertyId.title?.ar : appointment.propertyId.title?.en)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.propertyId.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client Details */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {appointment.userId?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.userId?.email || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {new Date(appointment.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {t(`appointments.status.${appointment.status}`)}
                      </span>
                    </td>

                    {/* Visit Type */}
                    <td className="px-4 py-3 text-sm">
                      {appointment.visitType ? (
                        t(`appointments.visitTypes.${appointment.visitType}`)
                      ) : 'N/A'}
                    </td>

                    {/* VR City */}
                    <td className="px-4 py-3 text-sm">
                      {appointment.visitType === 'office_vr' ? (appointment.vrCity || 'N/A') : '-'}
                    </td>

                    {/* Meeting Link */}
                    <td className="px-4 py-3">
                      {editingMeetingLink === appointment._id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder={t('appointments.actions.enterMeetingLink')}
                            className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs w-full"
                          />
                          <button
                            onClick={() =>
                              handleMeetingLinkUpdate(appointment._id)
                            }
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMeetingLink(null);
                              setMeetingLink("");
                            }}
                            className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          {appointment.meetingLink ? (
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 text-xs"
                            >
                              <LinkIcon className="w-3 h-3" />
                              {t('appointments.actions.viewLink')}
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs">{t('appointments.actions.noLinkYet')}</span>
                          )}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={() => {
                                setEditingMeetingLink(appointment._id);
                                setMeetingLink(appointment.meetingLink || "");
                              }}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <LinkIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Cancel Reason */}
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {appointment.cancelReason ? (
                        <span className="text-red-600">{appointment.cancelReason}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(appointment._id, "confirmed")}
                              className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                              title={t('appointments.actions.confirm')}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(appointment._id, "cancelled")}
                              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                              title={t('appointments.actions.cancel')}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openEditModal(appointment)}
                          className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title={t('appointments.actions.edit')}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('appointments.noAppointments')}
            </div>
          )}
        </motion.div>
      {editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('appointments.editModal.title')}</h2>
            {/* Always show edit form, backend will handle permission */}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Property (read-only for now) */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.property')}</label>
                <input
                  type="text"
                  value={editingAppointment?.propertyId?.title ? 
                    (i18n.language === 'ar' ? editingAppointment.propertyId.title.ar : editingAppointment.propertyId.title.en) || 
                    editingAppointment.propertyId.title.en || 
                    'Property' : ''}
                  className="w-full px-3 py-2 border rounded-xl bg-gray-100 text-gray-700"
                  readOnly
                />
              </div>
              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.date')}</label>
                <input
                  type="date"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                />
              </div>
              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.time')}</label>
                <input
                  type="time"
                  name="time"
                  value={editForm.time}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                />
              </div>
              {/* Visit Type */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.visitType')}</label>
                <select
                  name="visitType"
                  value={editForm.visitType}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                >
                  {VISIT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              {/* VR City */}
              {editForm.visitType === "office_vr" && (
                <div>
                  <label className="block text-sm font-medium mb-1">{t('appointments.editModal.vrCity')}</label>
                  <select
                    name="vrCity"
                    value={editForm.vrCity}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    required
                  >
                    <option value="">{t('appointments.editModal.selectVrCity')}</option>
                    {VR_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Meeting Platform */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.meetingPlatform')}</label>
                <select
                  name="meetingPlatform"
                  value={editForm.meetingPlatform}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                >
                  {MEETING_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>
              {/* Meeting Link */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.meetingLink')}</label>
                <input
                  type="url"
                  name="meetingLink"
                  value={editForm.meetingLink}
                  onChange={handleEditFormChange}
                  placeholder={t('appointments.editModal.meetingLinkPlaceholder')}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.notes')}</label>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('appointments.editModal.status')}</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                >
                  <option value="pending">{t('appointments.status.pending')}</option>
                  <option value="confirmed">{t('appointments.status.confirmed')}</option>
                  <option value="cancelled">{t('appointments.status.cancelled')}</option>
                  <option value="completed">{t('appointments.status.completed')}</option>
                </select>
              </div>
              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all duration-300" onClick={closeEditModal} disabled={editLoading}>{t('appointments.editModal.cancel')}</button>
                {/* Always show save button, backend will handle permission */}
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105" disabled={editLoading}>{editLoading ? t('appointments.editModal.saving') : t('appointments.editModal.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
