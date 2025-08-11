import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader,
  Filter,
  User,
  Shield,
  Building,
  UserCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../App";

const UsersPage = () => {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roles: [],
    password: ""
  });

  const roles = [
    { value: "client", label: t('users.filters.client'), icon: User },
    { value: "agent", label: t('users.filters.agent'), icon: UserCheck },
    { value: "seller", label: t('users.filters.seller'), icon: Building },
  ];

  const statuses = [
    { value: "active", label: t('users.status.active'), color: "bg-green-100 text-green-800" },
    { value: "inactive", label: t('users.status.inactive'), color: "bg-red-100 text-red-800" },
    { value: "pending", label: t('users.status.pending'), color: "bg-yellow-100 text-yellow-800" },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users with their roles from the new unified endpoint
      const response = await axios.get(`${backendurl}/api/users/all-with-roles`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(t('users.form.error'));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t('users.form.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.roles.length === 0 || !formData.password) {
      toast.error(t('users.form.requiredFields'));
      return;
    }

    try {
      setActionLoading(true);
      
      // Use the new unified API endpoint
      const response = await axios.post(
        `${backendurl}/api/users/create-with-role`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          roles: formData.roles, // array
          password: formData.password
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('users.form.success'));
        resetForm();
        setShowAddModal(false);
        fetchUsers();
      } else {
        toast.error(response.data.message || t('users.form.error'));
      }
    } catch (error) {
      console.error("Error adding user:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('users.form.error'));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error(t('users.form.requiredFields'));
      return;
    }

    try {
      setActionLoading(true);
      
      // Use the new unified API endpoint for updating users
      const response = await axios.put(
        `${backendurl}/api/users/update-with-role`,
        {
          userId: editingUser.user_id || editingUser._id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          roles: formData.roles,
          ...(formData.password ? { password: formData.password } : {})
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(t('users.form.updateSuccess'));
        resetForm();
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(response.data.message || t('users.form.updateError'));
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(t('users.form.updateError'));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, role) => {
    if (!window.confirm(t('users.actions.deleteConfirm'))) {
      return;
    }

    try {
      setActionLoading(true);
      let endpoint = "";

      switch (role) {
        case "client":
          endpoint = `${backendurl}/api/clients/${userId}`;
          break;
        case "agent":
          endpoint = `${backendurl}/api/agents/${userId}`;
          break;
        case "seller":
          endpoint = `${backendurl}/api/sellers/${userId}`;
          break;
        default:
          endpoint = `${backendurl}/api/users/${userId}`;
          break;
      }

      try {
        const response = await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) {
          toast.success("User deleted successfully");
          fetchUsers();
          return;
        }
      } catch (error) {
        // If the first delete fails, try the generic endpoint
        try {
          const response = await axios.delete(`${backendurl}/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (response.data.success) {
            toast.success("User deleted successfully");
            fetchUsers();
            return;
          } else {
            toast.error(response.data.message || "Failed to delete user");
          }
        } catch (err) {
          toast.error("Failed to delete user");
        }
      }
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.full_name || user.name || user.user_id?.name || "",
      email: user.email || user.user_id?.email || "",
      phone: user.phone || "",
      roles: user.roles || [],
      password: ""
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      roles: [],
      password: ""
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleValue, checked) => {
    setFormData(prev => {
      let newRoles = [...prev.roles];
      
      if (checked) {
        // Add role if not already present
        if (!newRoles.includes(roleValue)) {
          newRoles.push(roleValue);
        }
      } else {
        // Remove role
        newRoles = newRoles.filter(role => role !== roleValue);
      }
      
      return {
        ...prev,
        roles: newRoles
      };
    });
  };

  const getRoleIcon = (role) => {
    const roleData = roles.find(r => r.value === role);
    return roleData ? roleData.icon : Users;
  };

  const getRoleLabel = (role) => {
    const roleData = roles.find(r => r.value === role);
    return roleData ? roleData.label : role;
  };

  const getStatusColor = (status) => {
    const statusData = statuses.find(s => s.value === status);
    return statusData ? statusData.color : "bg-gray-100 text-gray-800";
  };

  const getUserDisplayName = (user) => {
    return user.full_name || user.name || user.user_id?.name || "Unknown";
  };

  const getUserDisplayEmail = (user) => {
    return user.email || user.user_id?.email || "No email";
  };

  useEffect(() => {
    fetchUsers();
  }, [i18n.language]); // Refetch when language changes

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      getUserDisplayName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserDisplayEmail(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone_number || user.phone || "").includes(searchTerm);

    const matchesRole = roleFilter === "all" || (user.roles && user.roles.includes(roleFilter));

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Users</h3>
          <p className="text-gray-600">{t('users.loading')}</p>
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
              {t('users.title')}
            </h1>
            <p className="text-gray-600">
              {t('users.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">{t('users.filters.allRoles')}</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              {t('users.addUser')}
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.table.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.table.contact')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('users.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  return (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50"
                    >
                      {/* User Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span key={role} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {getRoleLabel(role)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Contact (single phone number) */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.phone ? user.phone : t('users.messages.noPhone')}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            disabled={actionLoading}
                            title={t('users.actions.editUser')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* For delete, use the primary role or first role as default */}
                          <button
                            onClick={() => handleDeleteUser(user._id, user.primaryRole || (user.roles && user.roles[0]))}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            disabled={actionLoading}
                            title={t('users.actions.deleteUser')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || roleFilter !== "all" ? t('users.messages.noUsersFiltered') : t('users.messages.noUsersFound')}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingUser ? t('users.modal.editTitle') : t('users.modal.addTitle')}
            </h2>
            <form onSubmit={editingUser ? handleEditUser : handleAddUser}>
              <div className="space-y-6">
                {/* Name Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.modal.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={t('users.modal.enterName')}
                  />
                </div>
                {/* Email Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.modal.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={t('users.modal.enterEmail')}
                  />
                </div>
                {/* Phone Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.modal.phone')}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={t('users.modal.enterPhone')}
                  />
                </div>
                {/* Password Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.modal.password')}
                    {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={!editingUser}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder={editingUser ? t('users.modal.keepPassword') : t('users.modal.enterPassword')}
                  />
                </div>

                {/* Roles Field */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.modal.roles')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {roles.map((role) => (
                      <label key={role.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role.value)}
                          onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                          required={formData.roles.length === 0}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={actionLoading}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : editingUser ? (
                    t('common.update')
                  ) : (
                    t('common.add')
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

export default UsersPage; 