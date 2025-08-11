import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, Clock, Loader, X, Info, CheckCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';
import { useTranslation } from 'react-i18next';

const ScheduleViewing = ({ propertyId, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const visitTypes = [
    { value: "property", label: t('scheduleViewing.visitTypes.atProperty') },
    { value: "online", label: t('scheduleViewing.visitTypes.onlineMeeting') },
    { value: "office_vr", label: t('scheduleViewing.visitTypes.officeVR') },
  ];

  // VR Cities translated based on current language
  const vrCities = i18n.language === 'ar' 
    ? ['دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس', 'درعا', 'السويداء', 'القنيطرة', 'إدلب', 'الرقة', 'دير الزور', 'الحسكة', 'ريف دمشق']
    : ['Damascus', 'Aleppo', 'Homs', 'Hama', 'Latakia', 'Tartus', 'Daraa', 'Sweida', 'Quneitra', 'Idlib', 'Raqqa', 'Deir ez-Zor', 'Hasakah', 'Rif Dimashq'];

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    notes: '',
    visitType: 'property',
    vrCity: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Add step-based UI (1: date/time, 2: notes, 3: confirmation)
  const [isSuccess, setIsSuccess] = useState(false);

  // Available time slots from 9 AM to 6 PM
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  // Calculate date restrictions
  const dateRestrictions = useMemo(() => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    
    // Set time to beginning of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    
    return {
      min: today.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  }, []);

  const isWeekend = (date) => {
    const d = new Date(date);
    return d.getDay() === 0 || d.getDay() === 6;
  };

  const isPastTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const selected = new Date(formData.date);
    selected.setHours(hours, minutes);

    return selected < now;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (isWeekend(selectedDate)) {
      toast.error(t('scheduleViewing.errors.weekendsNotAvailable'));
      return;
    }
    setFormData(prev => ({ ...prev, date: selectedDate, time: '' }));
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    if (formData.date === dateRestrictions.min && isPastTime(selectedTime)) {
      toast.error(t('scheduleViewing.errors.selectFutureTime'));
      return;
    }
    setFormData(prev => ({ ...prev, time: selectedTime }));
  };

  const handleVisitTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, visitType: value, vrCity: value === 'office_vr' ? prev.vrCity : '' }));
  };
  const handleVrCityChange = (e) => {
    setFormData(prev => ({ ...prev, vrCity: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data before submission
    if (!formData.date || !formData.time || !formData.visitType) {
      toast.error(t('scheduleViewing.errors.incompleteForm'));
      return;
    }

    // Validate VR city if visit type is office_vr
    if (formData.visitType === 'office_vr' && !formData.vrCity) {
      toast.error(t('scheduleViewing.errors.vrCityRequired'));
      return;
    }

    // Validate propertyId format
    if (!propertyId || typeof propertyId !== 'string' || propertyId.length !== 24) {
      toast.error('Invalid property ID');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error(t('scheduleViewing.errors.loginRequired'));
        return;
      }
    
      setLoading(true);
      
      // Prepare data for submission - only include vrCity if visitType is office_vr
      // This ensures we don't send undefined values that might cause backend errors
      const submissionData = {
        propertyId: propertyId.toString(), // Ensure it's a string
        date: formData.date, // Backend will parse this string to Date
        time: formData.time,
        notes: formData.notes || '', // Ensure notes is never undefined
        visitType: formData.visitType,
        ...(formData.visitType === 'office_vr' && formData.vrCity && { vrCity: formData.vrCity })
      };
      
      console.log('Submitting appointment data:', submissionData);
      
      const response = await axios.post(
        `${Backendurl}/api/appointments/schedule`, 
        submissionData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000); // Auto close after 3 seconds
      }
    } catch (error) {
      console.error('Scheduling error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle specific backend error messages
      let errorMessage = t('scheduleViewing.errors.schedulingFailed');
      
      if (error.response?.status === 400) {
        // Bad request - show specific validation error
        errorMessage = error.response.data.message || 'Invalid request data';
      } else if (error.response?.status === 404) {
        // Property not found
        errorMessage = 'Property not found';
      } else if (error.response?.status === 500) {
        // Server error - show generic message
        console.error('Server error details:', error.response.data);
        errorMessage = t('scheduleViewing.errors.schedulingFailed');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display with proper localization
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, options);
  };

  // Custom Date Picker Component
  // Provides fully localized calendar with Arabic/English support
  // Replaces HTML5 date input for better localization control
  // Includes form submission prevention to avoid accidental submits
  const CustomDatePicker = ({ value, onChange, min, max, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const datePickerRef = useRef(null);

    // Close date picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getMonthName = (date) => {
      const options = { month: 'long', year: 'numeric' };
      const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
      return date.toLocaleDateString(locale, options);
    };

    const getDayNames = () => {
      const options = { weekday: 'short' };
      const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(2024, 0, i + 1);
        days.push(day.toLocaleDateString(locale, options));
      }
      return days;
    };

    const handleDateSelect = (day) => {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = selectedDate.toISOString().split('T')[0];
      onChange({ target: { value: dateString } });
      setIsOpen(false);
    };

    const isDateDisabled = (day) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if date is within allowed range
      const isOutOfRange = dateString < min || dateString > max;
      const isWeekendDay = isWeekend(dateString);
      
      return isOutOfRange || isWeekendDay;
    };

    const isSelected = (day) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      return selectedDate.getDate() === day && 
             selectedDate.getMonth() === currentDate.getMonth() && 
             selectedDate.getFullYear() === currentDate.getFullYear();
    };

    const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDay = getFirstDayOfMonth(currentDate);
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8"></div>);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const disabled = isDateDisabled(day);
        const selected = isSelected(day);
        days.push(
          <button
            key={day}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) {
                handleDateSelect(day);
              }
            }}
            disabled={disabled}
            className={`h-8 w-8 rounded-full text-sm transition-colors ${
              disabled 
                ? 'text-gray-300 cursor-not-allowed' 
                : selected 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {day}
          </button>
        );
      }
      
      return days;
    };

    return (
      <div className="relative" ref={datePickerRef}>
        <div 
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer bg-white"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value ? formatDate(value) : t('scheduleViewing.form.selectDatePlaceholder')}
          </span>
        </div>
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <h3 className="font-semibold text-gray-900">{getMonthName(currentDate)}</h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Days of Week */}
              <div className={`grid grid-cols-7 gap-1 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {getDayNames().map((day, index) => (
                  <div key={index} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className={`grid grid-cols-7 gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {renderCalendar()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Check if form can proceed to next step
  const canProceedToStep2 = formData.date && formData.time;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors z-10"
            aria-label={t('scheduleViewing.close')}
          >
            <X size={20} />
          </button>

          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 text-center">{t('scheduleViewing.title')}</h2>
              </div>

              {/* Step indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className={`flex flex-col items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-1 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{t('scheduleViewing.steps.dateTime')}</span>
                  </div>
                  <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                    <div className={`h-full bg-blue-600 transition-all duration-300`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
                  </div>
                  <div className={`flex flex-col items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-1 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                      <Info className="w-4 h-4" />
                    </div>
                    <span className="text-xs">{t('scheduleViewing.steps.details')}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('scheduleViewing.form.selectDate')}
                      </label>
                      <CustomDatePicker
                          value={formData.date}
                          onChange={handleDateChange}
                          min={dateRestrictions.min}
                          max={dateRestrictions.max}
                          disabled={loading}
                        />
                      <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                        <Info className="w-3 h-3 mr-1 inline flex-shrink-0" />
                        {t('scheduleViewing.form.dateInfo')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('scheduleViewing.form.selectTimeSlot')}
                      </label>
                      <div className="relative">
                        <select
                          value={formData.time}
                          onChange={handleTimeChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
                          required
                          disabled={!formData.date || loading}
                        >
                          <option value="">{t('scheduleViewing.form.chooseTimeSlot')}</option>
                          {timeSlots.map((slot) => (
                            <option 
                              key={slot} 
                              value={slot}
                              disabled={formData.date === dateRestrictions.min && isPastTime(slot)}
                            >
                              {slot}
                            </option>
                          ))}
                        </select>
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                        <Info className="w-3 h-3 mr-1 inline flex-shrink-0" />
                        {t('scheduleViewing.form.timeInfo')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('scheduleViewing.form.visitType')}</label>
                      <select
                        value={formData.visitType}
                        onChange={handleVisitTypeChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        required
                        disabled={loading}
                      >
                        {visitTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    {formData.visitType === 'office_vr' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('scheduleViewing.form.selectVRCity')}</label>
                        <select
                          value={formData.vrCity}
                          onChange={handleVrCityChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          required
                          disabled={loading}
                        >
                          <option value="">{t('scheduleViewing.form.selectCity')}</option>
                          {vrCities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => canProceedToStep2 && setStep(2)}
                        disabled={!canProceedToStep2 || loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                          transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"
                      >
                        {t('scheduleViewing.form.continue')}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{t('scheduleViewing.form.selectedTime')}</h3>
                        <button 
                          type="button" 
                          onClick={() => setStep(1)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {t('scheduleViewing.form.change')}
                        </button>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-gray-700">{formatDate(formData.date)}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-gray-700">{formData.time}</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                        <span>{t('scheduleViewing.form.additionalNotes')}</span>
                        <span className="text-gray-400 text-xs">({t('scheduleViewing.form.optional')})</span>
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        rows={4}
                        placeholder={t('scheduleViewing.form.notesPlaceholder')}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="lg:w-1/2 order-2 lg:order-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 
                          transition-colors flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        {t('scheduleViewing.form.back')}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="lg:w-1/2 order-1 lg:order-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
                          transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            {t('scheduleViewing.form.scheduling')}
                          </>
                        ) : (
                          t('scheduleViewing.form.scheduleViewing')
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('scheduleViewing.success.title')}</h3>
              <p className="text-gray-600 mb-6">
                {t('scheduleViewing.success.confirmationEmail')}
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 max-w-xs mx-auto mb-6">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-gray-700 text-sm">{formatDate(formData.date)}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-gray-700 text-sm">{formData.time}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                {t('scheduleViewing.success.agentContact')}
              </p>
              
              <button
                onClick={onClose}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('scheduleViewing.success.close')}
              </button>
            </motion.div>
          )}
          
          {/* Additional services info */}
          {!isSuccess && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <Users className={`w-4 h-4 text-blue-600 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span>{t('scheduleViewing.info.agentGuide')}</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScheduleViewing;