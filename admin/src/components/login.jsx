import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      try {
        response = await axios.post(`${backendUrl}/api/users/admin`, { email, password });
      } catch (adminError) {
        response = await axios.post(`${backendUrl}/api/users/login`, { email, password });
      }
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('roles', JSON.stringify(response.data.user.roles || []));
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.user.isAdmin) {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
        const roles = response.data.user.roles || [];
        if (response.data.user.isAdmin) {
          toast.success("Admin Login successful!");
          navigate("/dashboard");
        } else if (roles.includes('agent') || roles.includes('seller')) {
          toast.success("Login successful!");
          navigate("/list");
        } else {
          toast.error("You do not have permission to access the admin panel.");
          localStorage.removeItem('token');
          localStorage.removeItem('roles');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('user');
        }
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 overflow-hidden">
      {/* Subtle animated gradient blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-300 via-blue-200 to-transparent rounded-full blur-2xl opacity-40 animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-purple-300 via-indigo-200 to-transparent rounded-full blur-2xl opacity-40 animate-pulse-slow" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 md:p-10">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Login</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">Admin Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                  <FaUser />
                </span>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/80 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 placeholder-gray-400 transition-all duration-300"
                  placeholder="admin@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50/80 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-800 placeholder-gray-400 transition-all duration-300"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 font-semibold shadow-xl shadow-blue-500/25 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>
      </div>
      {/* Custom animation for gradient blobs */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.08); opacity: 0.6; }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Login;