import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Backendurl } from '../App';
import { Eye, EyeOff, Loader, CheckCircle, XCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const availableRoles = [
  { value: 'client', label: 'Client', label_ar: 'عميل', color: 'bg-blue-500' },
  { value: 'seller', label: 'Seller', label_ar: 'بائع', color: 'bg-green-500' },
  { value: 'agent', label: 'Agent', label_ar: 'وكيل', color: 'bg-purple-500' }
];

const UserProfile = () => {
  const { user, loading, setUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', roles: [], password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [validation, setValidation] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        roles: user.roles || [],
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!user) return <div className="text-center py-10">{t('userProfile.notLoggedIn')}</div>;

  const validate = (fields = form) => {
    const errors = {};
    if (!fields.name.trim()) errors.name = t('userProfile.validation.nameRequired');
    if (!fields.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) errors.email = t('userProfile.validation.emailInvalid');
    if (fields.phone && !/^\+?[0-9]{10,15}$/.test(fields.phone)) errors.phone = t('userProfile.validation.phoneInvalid');
    if (fields.password) {
      if (fields.password.length < 6) errors.password = t('userProfile.validation.passwordLength');
      if (fields.password !== fields.confirmPassword) errors.confirmPassword = t('userProfile.validation.passwordsMismatch');
    }
    if (!fields.roles.length) errors.roles = t('userProfile.validation.roleRequired');
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'roles') {
      let updatedRoles = form.roles;
      if (checked) {
        updatedRoles = [...updatedRoles, value];
      } else {
        updatedRoles = updatedRoles.filter(r => r !== value);
      }
      setForm(f => ({ ...f, roles: updatedRoles }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
      if (name === 'password') setPasswordStrength(calcStrength(value));
    }
    setValidation({ ...validation, [name]: undefined });
  };

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s += 1;
    if (/[A-Z]/.test(pw)) s += 1;
    if (/[a-z]/.test(pw)) s += 1;
    if (/[0-9]/.test(pw)) s += 1;
    if (/[^A-Za-z0-9]/.test(pw)) s += 1;
    return s;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errors = validate();
    setValidation(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        roles: form.roles,
      };
      if (form.password) payload.password = form.password;
      const res = await axios.put(
        `${Backendurl}/api/users/profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMessage({ type: 'success', text: t('userProfile.updateSuccess') });
        setEditMode(false);
        
        // Refresh user data from server to ensure we have the latest data
        try {
          const token = localStorage.getItem('token');
          const userResponse = await axios.get(`${Backendurl}/api/users/roles`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userResponse.data && userResponse.data.user) {
            setUser(userResponse.data.user);
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      } else {
        setMessage({ type: 'error', text: res.data.message || t('userProfile.updateError') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: t('userProfile.updateErrorGeneric') });
    } finally {
      setSaving(false);
    }
  };

  const passwordStrengthText = () => {
    if (passwordStrength >= 4) return t('userProfile.passwordStrength.strong');
    if (passwordStrength >= 2) return t('userProfile.passwordStrength.medium');
    return t('userProfile.passwordStrength.weak');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className={`bg-white rounded-2xl shadow-xl p-8 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          {isRTL ? (
            <>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow leading-[2]">{t('userProfile.title')}</h2>
            <User className="w-8 h-8 text-blue-500" />
          </>
          ) : (
            <>
            <User className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow leading-[2]">{t('userProfile.title')}</h2>
          </>
          )}
        </div>
        {message && (
          <div className={`mb-4 p-3 rounded flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} ${isRTL ? 'flex-row-reverse' : ''}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}
        {!editMode ? (
          <div className="space-y-4">
            <div className={`flex items-center gap-4 ${isRTL ? ' text-right' : ''}`}>
              <div className="text-2xl font-bold text-gray-900">{user.name}</div>
              <div className="flex gap-2">
                {user.roles.map(role => {
                  const meta = availableRoles.find(r => r.value === role);
                  return <span key={role} className={`px-2 py-1 rounded text-xs text-white ${meta?.color || 'bg-gray-400'}`}>{isRTL ? meta?.label_ar : meta?.label || role}</span>;
                })}
              </div>
            </div>
            <div className={`text-gray-700 ${isRTL ? 'text-right' : ''}`}><span className="font-semibold">{t('userProfile.emailLabel')}:</span> {user.email}</div>
            <div className={`text-gray-700 ${isRTL ? 'text-right' : ''}`}><span className="font-semibold">{t('userProfile.phoneLabel')}:</span> {user.phone || <span className="text-gray-400">{t('userProfile.notSet')}</span>}</div>
            <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition" onClick={() => setEditMode(true)}>{t('userProfile.editProfile')}</button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">{t('userProfile.nameLabel')}</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${validation.name ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-200 ${isRTL ? 'text-right' : ''}`} />
                {validation.name && <div className="text-xs text-red-500 mt-1">{validation.name}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('userProfile.emailLabel')}</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${validation.email ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-200 ${isRTL ? 'text-right' : ''}`} />
                {validation.email && <div className="text-xs text-red-500 mt-1">{validation.email}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('userProfile.phoneLabel')}</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${validation.phone ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-200 ${isRTL ? 'text-right' : ''}`} />
                {validation.phone && <div className="text-xs text-red-500 mt-1">{validation.phone}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('userProfile.passwordLabel')} <span className="text-gray-400 text-xs">{t('userProfile.passwordHint')}</span></label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${validation.password ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-200 ${isRTL ? 'text-right' : ''}`} autoComplete="new-password" />
                  <button type="button" className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-2.5 text-gray-400`} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {form.password && (
                  <div className={`flex items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-2 w-24 rounded-full ${passwordStrength >= 4 ? 'bg-green-400' : passwordStrength >= 2 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-gray-500">{passwordStrengthText()}</span>
                  </div>
                )}
                {validation.password && <div className="text-xs text-red-500 mt-1">{validation.password}</div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('userProfile.confirmPasswordLabel')}</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${validation.confirmPassword ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-200 ${isRTL ? 'text-right' : ''}`} autoComplete="new-password" />
                  <button type="button" className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-2.5 text-gray-400`} onClick={() => setShowConfirm(v => !v)}>{showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
                {validation.confirmPassword && <div className="text-xs text-red-500 mt-1">{validation.confirmPassword}</div>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('userProfile.rolesLabel')} <span className="text-gray-400 text-xs">{t('userProfile.rolesHint')}</span></label>
              <div className={`flex gap-4 flex-wrap ${isRTL ? '' : ''}`}>
                {availableRoles.map(role => (
                  <label key={role.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${form.roles.includes(role.value) ? role.color + ' text-white border-transparent' : 'border-gray-200 bg-gray-50 text-gray-700'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="checkbox"
                      name="roles"
                      value={role.value}
                      checked={form.roles.includes(role.value)}
                      onChange={handleChange}
                      className="accent-blue-600"
                    />
                    {isRTL ? role.label_ar : role.label}
                  </label>
                ))}
              </div>
              {validation.roles && <div className="text-xs text-red-500 mt-1">{validation.roles}</div>}
            </div>
            <div className={`flex gap-4 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60">{saving ? t('userProfile.saving') : t('userProfile.saveChanges')}</button>
              <button type="button" className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition" onClick={() => { setEditMode(false); setMessage(null); setValidation({}); setForm({ ...form, password: '', confirmPassword: '' }); }}>{t('userProfile.cancel')}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 