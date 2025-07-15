import { useState } from 'react';
import axios from 'axios';
import { Backendurl } from '../App';
import { toast } from 'react-toastify';

const TestSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: ['client'],
    primaryRole: 'client'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Testing signup with data:', formData);
      
      const response = await axios.post(
        `${Backendurl}/api/users/test-register`, 
        formData
      );
      
      console.log('Test signup response:', response.data);
      
      if (response.data.success) {
        toast.success('Test registration successful!');
        console.log('Token:', response.data.token);
        console.log('User:', response.data.user);
      } else {
        toast.error(response.data.message || 'Test registration failed');
      }
    } catch (error) {
      console.error('Test signup error:', error);
      
      if (error.response) {
        console.error('Server error:', error.response.data);
        toast.error(error.response.data.message || 'Server error');
      } else if (error.request) {
        console.error('Network error:', error.request);
        toast.error('Network error. Check if backend is running.');
      } else {
        console.error('Other error:', error.message);
        toast.error('Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Signup</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backend URL
            </label>
            <input
              type="text"
              value={Backendurl}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Registration'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-600">
            Backend URL: {Backendurl}
          </p>
          <p className="text-sm text-gray-600">
            Check console for detailed logs
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestSignup; 