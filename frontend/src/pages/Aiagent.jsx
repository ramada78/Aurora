import { useState, useEffect } from "react";
import PropertyCard from "../components/ai/PropertyCard";
import { recommendProperties, getLastSearches, aggregatePreferences } from "../services/api";
import { useAuth } from '../context/AuthContext';
import PropTypes from "prop-types";
import AiHubSEO from "../components/SEO/AiHubSEO";
import StructuredData from "../components/SEO/StructuredData";
import { Brain, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const AIPropertyHub = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const { isLoggedIn } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  useEffect(() => {
    const fetchRecommendations = async () => {
      setRecLoading(true);
      const lastSearches = await getLastSearches();
      const preferences = aggregatePreferences(lastSearches);
      console.log('Aggregated preferences for AI recommendations:', preferences);
      if (Object.keys(preferences).length > 0) {
        const recs = await recommendProperties(preferences);
        setRecommendations(recs);
      } else {
        setRecommendations([]);
      }
      setRecLoading(false);
    };
    fetchRecommendations();
  }, [isLoggedIn]);

  return (
    <div className="relative min-h-screen bg-gray-50 pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
      {/* Aurora SVG Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <radialGradient id="aurora1" cx="50%" cy="40%" r="80%" fx="60%" fy="30%" gradientTransform="rotate(10)">
              <stop offset="0%" stopColor="#7fbcff" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#a5f3fc" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="aurora2" cx="80%" cy="80%" r="80%" fx="80%" fy="80%">
              <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#f472b6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="800" cy="350" rx="700" ry="250" fill="url(#aurora1)" />
          <ellipse cx="1200" cy="800" rx="500" ry="180" fill="url(#aurora2)" />
        </svg>
      </div>
      <AiHubSEO />
      <StructuredData type="aiHub" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero/Intro section */}
        <div className={`mb-8 sm:mb-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg sm:shadow-xl relative overflow-hidden ${isRTL ? 'text-right' : 'text-center'}`}>
          <div className={`absolute -top-10 ${isRTL ? 'left-0' : 'right-0'} opacity-30 pointer-events-none select-none`}>
            <Sparkles className="w-32 h-32 text-blue-200" />
          </div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 shadow-lg p-4">
                <Brain className="w-12 h-12 text-white drop-shadow-lg" />
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-cyan-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              {t('aiAgent.title')}
            </h1>
            <p className="text-blue-100 text-lg sm:text-xl mb-6 sm:mb-8">
              {t('aiAgent.description')}
            </p>
          </div>
        </div>
        {/* Recommendations section */}
        <div className="mt-10">
          <h2 className={`text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2 ${isRTL ? '' : ''}`}>
            <Sparkles className="w-6 h-6 text-blue-400" /> {t('aiAgent.recommendedForYou')}
          </h2>
          {recLoading ? (
            <div className="text-gray-500">{t('aiAgent.loadingRecommendations')}</div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500">{t('aiAgent.noRecommendations')}</div>
          )}
        </div>
        {/* Decorative Aurora Pattern at Bottom */}
        <div className="absolute left-0 right-0 bottom-0 z-0 pointer-events-none select-none">
          <svg width="100%" height="120" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 Q360,120 720,60 Q1080,0 1440,80 L1440,120 L0,120 Z" fill="url(#aurora-bottom)" />
            <defs>
              <linearGradient id="aurora-bottom" x1="0" y1="0" x2="1440" y2="120" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a5f3fc" stopOpacity="0.7" />
                <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="1" stopColor="#f472b6" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-100">
    <div className="text-blue-600 mb-2 sm:mb-3">{icon}</div>
    <h3 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base">
      {title}
    </h3>
    <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
  </div>
);

FeatureCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default AIPropertyHub;
