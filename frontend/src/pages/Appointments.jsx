import React, { useEffect, useState } from 'react';
import { getUserAppointments, cancelAppointment } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Home, X, CheckCircle, AlertTriangle, Loader, ArrowRight, XCircle } from 'lucide-react';
import { Backendurl } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const statusMeta = {
    requested: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} /> },
    confirmed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} /> },
    completed: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} /> },
    cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} /> },
  };
  
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const data = await getUserAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError(t('appointmentsPage.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [t]);

  const openModal = (appt) => {
    setSelected(appt);
    setShowModal(true);
    setCancelReason('');
    setCancelError(null);
    setSuccessMsg(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setCancelReason('');
    setCancelError(null);
    setSuccessMsg(null);
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelAppointment(selected._id, cancelReason);
      setSuccessMsg(t('appointmentsPage.cancelSuccess'));
      setAppointments(appts => appts.map(a => a._id === selected._id ? { ...a, status: 'cancelled', cancelReason } : a));
    } catch (err) {
      setCancelError(t('appointmentsPage.cancelError'));
    } finally {
      setCancelLoading(false);
    }
  };

  // Helper to get full image URL
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('/uploads/')) return Backendurl + img;
    return img;
  };

  // Status badge color
  const statusBadge = (status) => {
    let key = status;
    if (status === 'pending' || status === 'requested') key = 'requested';
    if (status === 'confirmed') key = 'confirmed';
    if (status === 'completed') key = 'completed';
    if (status === 'cancelled') key = 'cancelled';
    const meta = statusMeta[key] || statusMeta['requested'];
    const statusKey = `appointmentsPage.status.${key}`;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow ${meta.color} ${isRTL ? '' : ''}`}>{meta.icon}{t(statusKey)}</span>;
  };

  // Timeline for status
  const statusTimeline = (status) => {
    const steps = ['requested', 'confirmed', 'completed'];
    const cancelledStep = 'cancelled';
    let currentIdx = -1;
    if (status === 'pending' || status === 'requested') currentIdx = 0;
    else if (status === 'confirmed') currentIdx = 1;
    else if (status === 'completed') currentIdx = 2;
    const stepsToRender = isRTL ? [...steps].reverse() : steps;

    return (
      <div className={`flex items-center gap-2 mt-2 ${isRTL ? 'flex-row-reverse justify-end text-right' : ''}`}>
        {stepsToRender.map((step, i) => {
          const idx = isRTL ? steps.length - 1 - i : i;
          return (
          <React.Fragment key={step}>
              <div className={`flex items-center gap-1 ${isRTL ? '' : ''} ${idx <= currentIdx && status !== cancelledStep ? 'text-blue-600' : 'text-gray-300'}`}>
              {statusMeta[step]?.icon}
              <span className="text-xs">{t(`appointmentsPage.status.${step}`)}</span>
            </div>
              {i < stepsToRender.length - 1 && (
                isRTL
                  ? <ArrowRight className="w-4 h-4 rotate-180" />
                  : <ArrowRight className="w-4 h-4" />
              )}
          </React.Fragment>
          );
        })}
        {status === cancelledStep && (
          <div className="flex items-center gap-1 text-red-600">
            {statusMeta[cancelledStep]?.icon}
            <span className="text-xs">{t(`appointmentsPage.status.${cancelledStep}`)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 pt-10 pb-8 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4">
        <div className={`flex items-center gap-3 mb-8 ${isRTL ? '' : ''}`}>
          <Calendar className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight drop-shadow">{t('appointmentsPage.title')}</h2>
        </div>
        {loading ? (
          <div className={`flex items-center gap-2 text-blue-600 ${isRTL ? 'flex-row-reverse justify-center' : 'justify-center'}`}><Loader className="w-5 h-5 animate-spin" /> {t('appointmentsPage.loading')}</div>
        ) : error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16">
            <Calendar className="w-16 h-16 text-blue-200" />
            <div className="text-gray-600 text-lg">{t('appointmentsPage.noAppointments')}</div>
          </div>
        ) : (
          <motion.div layout className="flex flex-col gap-8">
            {appointments.map(appt => (
              <motion.div
                key={appt._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 min-h-[220px] flex"
              >
                {/* Background Image with Overlay */}
                <div
                  className="absolute inset-0 w-full h-full cursor-pointer z-0"
                  style={{ backgroundImage: `url('${getImageUrl(isRTL && appt.propertyId?.image_ar?.[0] ? appt.propertyId?.image_ar[0] : appt.propertyId?.image?.[0])}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  onClick={() => navigate(`/properties/single/${appt.propertyId?._id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 z-10" />
                </div>
                {/* Card Content on top of overlay */}
                <div className={`relative z-20 flex-1 flex flex-col p-8 gap-2 text-white ${isRTL ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isRTL ? '' : ''}`}>
                    <Home className="w-5 h-5 text-blue-200" />
                    <span className="font-semibold text-lg line-clamp-1">{isRTL ? appt.propertyId?.title_ar : appt.propertyId?.title_en}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-blue-100 text-sm ${isRTL ? '' : ''}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{appt.date ? new Date(appt.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : ''}</span>
                    <Clock className={`w-4 h-4 ${isRTL ? 'mr-3' : 'ml-3'}`} />
                    <span>{appt.time}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-blue-100 text-sm ${isRTL ? '' : ''}`}>
                    <span className="font-semibold">{t('appointmentsPage.visitType')}:</span>
                    <span>{t(`appointmentsPage.visitTypes.${appt.visitType}`)}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-blue-100 text-sm ${isRTL ? '' : ''}`}>
                    <span className="font-semibold">{t('appointmentsPage.statusLabel')}:</span>
                    {statusBadge(appt.status)}
                  </div>
                  {statusTimeline(appt.status)}
                  <div className={`flex gap-3 mt-4 ${isRTL ? '' : ''}`}>
                    <button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition-all w-max" onClick={() => openModal(appt)}>{t('appointmentsPage.viewDetails')}</button>
                    <button className="px-5 py-2 bg-white/80 text-blue-700 rounded-lg font-semibold shadow hover:bg-white transition-all w-max border border-blue-200" onClick={() => navigate(`/properties/single/${appt.propertyId?._id}`)}>{t('appointmentsPage.viewProperty')}</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      {/* Modal for details and cancellation */}
      <AnimatePresence>
        {showModal && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 40 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn ${isRTL ? 'text-right' : ''}`}
            >
              <button className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-700 text-2xl`} onClick={closeModal}><X /></button>
              <h3 className={`text-xl font-bold mb-4 text-blue-700 flex items-center gap-2 ${isRTL ? '' : ''}`}>
                <Calendar className="w-5 h-5" /> {t('appointmentsPage.modalTitle')}
              </h3>
              <div className={`mb-4 flex items-center gap-3 ${isRTL ? '' : ''}`}>
                <img src={getImageUrl(isRTL && selected.propertyId?.image_ar?.[0] ? selected.propertyId?.image_ar[0] : selected.propertyId?.image?.[0])} alt={isRTL ? selected.propertyId?.title_ar : selected.propertyId?.title_en} className="w-16 h-16 object-cover rounded-xl border" />
                <div className={`${isRTL ? 'text-right' : ''}`}>
                  <div className="font-semibold text-gray-900">{isRTL ? selected.propertyId?.title_ar : selected.propertyId?.title_en}</div>
                  <div className={`text-xs text-gray-500 flex items-center gap-1 ${isRTL ? '' : ''}`}><MapPin className="w-4 h-4" />{selected.propertyId?.cityId?.name || t('appointmentsPage.notAvailable')}</div>
                </div>
              </div>
              <div className={`mb-2 flex items-center gap-2 ${isRTL ? '' : ''}`}><Calendar className="w-4 h-4 text-blue-500" /><span className="font-semibold">{t('appointmentsPage.dateLabel')}:</span> {selected.date ? new Date(selected.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US') : ''}</div>
              <div className={`mb-2 flex items-center gap-2 ${isRTL ? '' : ''}`}><Clock className="w-4 h-4 text-blue-500" /><span className="font-semibold">{t('appointmentsPage.timeLabel')}:</span> {selected.time}</div>
                             <div className={`mb-2 flex items-center gap-2 ${isRTL ? '' : ''}`}><span className="font-semibold">{t('appointmentsPage.visitTypeLabel')}:</span> {t(`appointmentsPage.visitTypes.${selected.visitType}`)}</div>
              <div className={`mb-2 flex items-center gap-2 ${isRTL ? '' : ''}`}><span className="font-semibold">{t('appointmentsPage.statusLabel')}:</span> {statusBadge(selected.status)}</div>
              {statusTimeline(selected.status)}
              {selected.notes && <div className={`mb-2 ${isRTL ? 'text-right' : ''}`}><span className="font-semibold">{t('appointmentsPage.notesLabel')}:</span> {selected.notes}</div>}
              {selected.cancelReason && <div className={`mb-2 flex items-center gap-2 text-red-600 ${isRTL ? 'flex-row-reverse' : ''}`}><AlertTriangle className="w-4 h-4" /><span className="font-semibold">{t('appointmentsPage.cancelReasonLabel')}:</span> {selected.cancelReason}</div>}
              <div className={`mb-4 ${isRTL ? 'text-right' : ''}`}><span className="font-semibold">{t('appointmentsPage.meetingLinkLabel')}:</span> {selected.meetingLink ? <a href={selected.meetingLink} className={`${isRTL ? 'mr-2' : 'ml-2'} px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition`} target="_blank" rel="noopener noreferrer">{t('appointmentsPage.joinMeeting')}</a> : t('appointmentsPage.notAvailable')}</div>
              
              {successMsg ? (
                <div className={`mb-2 text-green-600 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}><CheckCircle className="w-5 h-5" />{successMsg}</div>
              ) : selected.status === 'requested' || selected.status === 'confirmed' ? (
                <div className="mt-4">
                  <label className={`block font-semibold mb-1 ${isRTL ? 'text-right' : ''}`}>{t('appointmentsPage.cancelModalTitle')}:</label>
                  <textarea
                    className={`w-full border rounded px-3 py-2 mb-2 ${isRTL ? 'text-right' : ''}`}
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder={t('appointmentsPage.cancelPlaceholder')}
                    rows={2}
                  />
                  {cancelError && <div className="text-red-600 mb-2">{cancelError}</div>}
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-all"
                    onClick={handleCancel}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? t('appointmentsPage.cancelling') : t('appointmentsPage.requestCancellation')}
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments; 