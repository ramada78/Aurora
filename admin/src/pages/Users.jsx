import React, { useState, useEffect } from "react";
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
    { value: "client", label: "Client", icon: User },
    { value: "agent", label: "Agent", icon: UserCheck },
    { value: "seller", label: "Seller", icon: Building },
    // Note: All roles now supported through unified API
  ];

  const statuses = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-800" },
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
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
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.roles.length === 0 || !formData.password) {
      toast.error("Please fill in all required fields, select at least one role, and set a password");
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
        toast.success(`${response.data.message}`);
        resetForm();
        setShowAddModal(false);
        fetchUsers();
      } else {
        toast.error(response.data.message || "Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add user. Please check the console for details.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
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
        toast.success("User updated successfully");
        resetForm();
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update user");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, role) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
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
  }, []);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Users</h1>
            <p className="text-gray-600">
              Manage all users including clients, agents, and sellers.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Contact (single phone number) */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.phone ? user.phone : "No phone"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            disabled={actionLoading}
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* For delete, use the primary role or first role as default */}
                          <button
                            onClick={() => handleDeleteUser(user._id, user.primaryRole || (user.roles && user.roles[0]))}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            disabled={actionLoading}
                            title="Delete user"
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
              {searchTerm || roleFilter !== "all" ? "No users found matching your criteria" : "No users found"}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            <form onSubmit={editingUser ? handleEditUser : handleAddUser}>
              <div className="space-y-4">
                {/* Name Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter name"
                  />
                </div>
                {/* Email Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email"
                  />
                </div>
                {/* Phone Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number (optional)"
                  />
                </div>
                {/* Password Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">
                    Password 
                    {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required={!editingUser}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  />
                </div>

                {/* Roles Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Roles <span className="text-red-500">*</span></label>
                  <div className="flex gap-4">
                    {roles.map((role) => (
                      <label key={role.value} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={formData.roles.includes(role.value)}
                          onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                          required={formData.roles.length === 0}
                        />
                        {role.label}
                      </label>
                    ))}
                  </div>
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
                  ) : editingUser ? (
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

export default UsersPage; 