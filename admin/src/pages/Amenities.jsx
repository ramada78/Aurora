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

const Amenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [amenityName, setAmenityName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/amenities`);
      if (response.data.success) {
        setAmenities(response.data.amenities || []);
      } else {
        toast.error("Failed to fetch amenities");
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast.error("Failed to fetch amenities");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = async (e) => {
    e.preventDefault();
    if (!amenityName.trim()) {
      toast.error("Please enter an amenity name");
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.post(
        `${backendurl}/api/amenities`,
        { name: amenityName.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Amenity added successfully");
        setAmenityName("");
        setShowAddModal(false);
        fetchAmenities();
      } else {
        toast.error(response.data.message || "Failed to add amenity");
      }
    } catch (error) {
      console.error("Error adding amenity:", error);
      toast.error("Failed to add amenity");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAmenity = async (e) => {
    e.preventDefault();
    if (!amenityName.trim()) {
      toast.error("Please enter an amenity name");
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.put(
        `${backendurl}/api/amenities/${editingAmenity._id}`,
        { name: amenityName.trim() },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Amenity updated successfully");
        setAmenityName("");
        setEditingAmenity(null);
        fetchAmenities();
      } else {
        toast.error(response.data.message || "Failed to update amenity");
      }
    } catch (error) {
      console.error("Error updating amenity:", error);
      toast.error("Failed to update amenity");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAmenity = async (amenityId) => {
    if (!window.confirm("Are you sure you want to delete this amenity?")) {
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
        toast.success("Amenity deleted successfully");
        fetchAmenities();
      } else {
        toast.error(response.data.message || "Failed to delete amenity");
      }
    } catch (error) {
      console.error("Error deleting amenity:", error);
      toast.error("Failed to delete amenity");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (amenity) => {
    setEditingAmenity(amenity);
    setAmenityName(amenity.name);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAmenity(null);
    setAmenityName("");
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const filteredAmenities = amenities.filter((amenity) =>
    amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Amenities</h1>
            <p className="text-gray-600">
              Manage property amenities and features
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search amenities..."
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
              Add Amenity
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
                    Amenity Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
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
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Settings className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {amenity.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(amenity)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          disabled={actionLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAmenity(amenity._id)}
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

          {filteredAmenities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No amenities found matching your search" : "No amenities found"}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingAmenity) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingAmenity ? "Edit Amenity" : "Add New Amenity"}
            </h2>
            <form onSubmit={editingAmenity ? handleEditAmenity : handleAddAmenity}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenity Name
                </label>
                <input
                  type="text"
                  value={amenityName}
                  onChange={(e) => setAmenityName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amenity name"
                  required
                />
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
                  ) : editingAmenity ? (
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

export default Amenities; 