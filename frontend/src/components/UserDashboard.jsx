import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Building, UserCheck, Settings, Phone, Mail, Save, Loader } from 'lucide-react';
import { Backendurl } from '../App';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switchingRole, setSwitchingRole] = useState(false);

  const roleIcons = {
    client: User,
    seller: Building,
    agent: UserCheck
  };

  const roleColors = {
    client: 'bg-blue-500',
    seller: 'bg-green-500',
    agent: 'bg-purple-500'
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/users/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (newRole) => {
    try {
      setSwitchingRole(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${Backendurl}/api/users/switch-role`,
        { primaryRole: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUserData(prev => ({ ...prev, primaryRole: newRole }));
        toast.success(`Switched to ${newRole} role`);
      }
    } catch (error) {
      console.error('Error switching role:', error);
      toast.error('Failed to switch role');
    } finally {
      setSwitchingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p className="text-gray-600">Failed to load user data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userData.name}!</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Role Management</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Current Primary Role</h3>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-white ${roleColors[userData.primaryRole]}`}>
              {React.createElement(roleIcons[userData.primaryRole], { className: "w-4 h-4 mr-2" })}
              {userData.primaryRole.charAt(0).toUpperCase() + userData.primaryRole.slice(1)}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Switch Primary Role</h3>
            <div className="space-y-3">
              {userData.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  disabled={switchingRole || role === userData.primaryRole}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                    role === userData.primaryRole
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${switchingRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    {React.createElement(roleIcons[role], { className: "w-5 h-5 mr-3" })}
                    <span className="font-medium">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 