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

const PropertyTypes = () => {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeName, setTypeName] = useState("");
  const [category, setCategory] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const categories = ["Residential", "Commercial", "Land", "Industrial"];

  const fetchPropertyTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/property-types`);
      if (response.data.success) {
        setPropertyTypes(response.data.types || []);
      } else {
        toast.error("Failed to fetch property types");
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
      toast.error("Failed to fetch property types");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPropertyType = async (e) => {
    e.preventDefault();
    if (!typeName.trim() || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.post(
        `${backendurl}/api/property-types`,
        {
          type_name: typeName.trim(),
          category: category,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Property type added successfully");
        setTypeName("");
        setCategory("");
        setShowAddModal(false);
        fetchPropertyTypes();
      } else {
        toast.error(response.data.message || "Failed to add property type");
      }
    } catch (error) {
      console.error("Error adding property type:", error);
      toast.error("Failed to add property type");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPropertyType = async (e) => {
    e.preventDefault();
    if (!typeName.trim() || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.put(
        `${backendurl}/api/property-types/${editingType._id}`,
        {
          type_name: typeName.trim(),
          category: category,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Property type updated successfully");
        setTypeName("");
        setCategory("");
        setEditingType(null);
        fetchPropertyTypes();
      } else {
        toast.error(response.data.message || "Failed to update property type");
      }
    } catch (error) {
      console.error("Error updating property type:", error);
      toast.error("Failed to update property type");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePropertyType = async (typeId) => {
    if (!window.confirm("Are you sure you want to delete this property type?")) {
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
        toast.success("Property type deleted successfully");
        fetchPropertyTypes();
      } else {
        toast.error(response.data.message || "Failed to delete property type");
      }
    } catch (error) {
      console.error("Error deleting property type:", error);
      toast.error("Failed to delete property type");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (propertyType) => {
    setEditingType(propertyType);
    setTypeName(propertyType.type_name);
    setCategory(propertyType.category);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingType(null);
    setTypeName("");
    setCategory("");
  };

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

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  const filteredPropertyTypes = propertyTypes.filter((type) =>
    type.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Property Types</h1>
            <p className="text-gray-600">
              Manage property types and categories
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search property types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Property Type
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
                    Type Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {propertyType.type_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                          propertyType.category
                        )}`}
                      >
                        {propertyType.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(propertyType)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          disabled={actionLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePropertyType(propertyType._id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          disabled={actionLoading}
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

          {filteredPropertyTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No property types found matching your search" : "No property types found"}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingType) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingType ? "Edit Property Type" : "Add New Property Type"}
            </h2>
            <form onSubmit={editingType ? handleEditPropertyType : handleAddPropertyType}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type Name
                </label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter property type name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
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
                  ) : editingType ? (
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

export default PropertyTypes; 