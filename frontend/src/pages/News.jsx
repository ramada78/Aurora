import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Tag, Eye, ArrowRight, Search, Filter, Clock, Share2, ExternalLink, ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react';
import { Backendurl } from '../App';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// Animation variants (same as Blog component)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const pulseAnimation = {
  scale: [1, 1.1, 1],
  transition: { 
    duration: 0.3,
    ease: "easeInOut"
  }
};

const floatingAnimation = {
  y: [-5, 5, -5],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// NewsCard component (same design as BlogCard)
const NewsCard = ({ newsItem, index }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isHovered, setIsHovered] = useState(false);


  // Helper functions defined first
  const getLocalizedTitle = (item) => {
    return i18n.language === 'ar' ? (item.title?.ar || item.title?.en) : (item.title?.en || item.title?.ar);
  };

  const getLocalizedExcerpt = (item) => {
    return i18n.language === 'ar' ? (item.excerpt?.ar || item.excerpt?.en) : (item.excerpt?.en || item.excerpt?.ar);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const shareData = {
        title: getLocalizedTitle(newsItem),
        text: getLocalizedExcerpt(newsItem),
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(t('post_shared_successfully'), {
          style: { borderRadius: '12px', background: '#10B981', color: '#fff' }
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('link_copied_to_clipboard'), {
          style: { borderRadius: '12px', background: '#10B981', color: '#fff' }
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error(t('unable_to_share_post'), {
        style: { borderRadius: '12px', background: '#EF4444', color: '#fff' }
      });
    }
  };



  const handleReadMore = () => {
    // Navigate to single article page
    window.location.href = `/news/${newsItem._id}`;
  };

  const estimatedReadTime = Math.ceil(getLocalizedExcerpt(newsItem).split(' ').length / 200);
  
  // Map of known categories to translation keys
  const categoriesMap = {
    real_estate: t('real_estate'),
    buying: t('buying'),
    selling: t('selling'),
    investment: t('investment'),
    tips: t('tips'),
    market_trends: t('market_trends'),
  };
  const categoryKey = newsItem.category || 'real_estate';
  const categoryLabel = categoriesMap[categoryKey] || categoryKey;

  return (
    <motion.div
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 cursor-pointer transform-gpu"
      variants={cardVariants}
      whileHover={{ 
        y: -12, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)" 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleReadMore}
    >
      <div className="relative overflow-hidden aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-50 to-indigo-100">
        <img
          src={newsItem.image}
          alt={getLocalizedTitle(newsItem)}
          className="w-full h-64 object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
          }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500 ${isHovered ? 'opacity-90' : 'opacity-60'}`} />
        
        {/* Floating badge with animation */}
        <motion.div 
          className="absolute top-6 left-6 z-10"
          animate={floatingAnimation}
        >
          <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg border border-white/20">
            {categoryLabel}
          </span>
        </motion.div>

        {/* View count */}
        <div className="absolute top-6 right-20 z-10 flex items-center gap-1 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white text-xs">
          <Eye className="w-3 h-3" />
          {newsItem.views || 0}
        </div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 p-6 flex justify-center"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadMore();
                }}
                className="px-6 py-3 bg-white/95 backdrop-blur-sm text-blue-600 rounded-full flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-sm shadow-xl border border-white/50 group-hover:scale-105"
              >
                {t('read_full_article')} <ExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-6 right-6">
          <motion.button
            whileTap={pulseAnimation}
            onClick={handleShare}
            className="p-3 bg-white/90 backdrop-blur-md text-gray-700 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 shadow-lg border border-white/20"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between text-gray-500 text-xs mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-500`} />
              <span className="font-medium">{formatDate(newsItem.publishedAt || newsItem.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-green-500`} />
              <span className="font-medium">{estimatedReadTime} {t('min_read')}</span>
            </div>
          </div>
          {newsItem.featured && (
            <div className="flex items-center text-orange-500">
              <TrendingUp className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              <span className="text-xs font-medium">{t('trending')}</span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
          {getLocalizedTitle(newsItem)}
        </h3>
        
        <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
          {getLocalizedExcerpt(newsItem)}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{newsItem.author}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReadMore();
            }}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300 text-sm group/btn"
          >
            {t('continue_reading')}
            {isRTL ? <ChevronLeft className="w-4 h-4 mr-1 group-hover/btn:translate-x-1 transition-transform duration-300" /> : <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-300" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const News = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { key: 'all', label: t('all') },
    { key: 'buying', label: t('buying') },
    { key: 'selling', label: t('selling') },
    { key: 'investment', label: t('investment') },
    { key: 'tips', label: t('tips') },
    { key: 'market_trends', label: t('market_trends') },
    { key: 'real_estate', label: t('real_estate') },
  ];

  const fetchNews = async (page = 1, category = selectedCategory, search = searchTerm) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        lang: i18n.language
      });
      
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      if (search) {
        params.append('search', search);
      }

      const response = await axios.get(`${Backendurl}/api/news/news?${params}`);
      
      if (response.data.success) {
        setNews(response.data.news || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [i18n.language]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews(1, selectedCategory, searchTerm);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchNews(1, category, searchTerm);
  };

  const handlePageChange = (page) => {
    fetchNews(page, selectedCategory, searchTerm);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_news')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t('news.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {t('news.description')}
          </motion.p>
        </motion.div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('news.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t('search')}
              </button>
            </form>

            {/* Category Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {news.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {t('news.noNewsFound')}
              </h3>
              <p className="text-gray-600">
                {t('news.noNewsDescription')}
              </p>
            </div>
          ) : (
            <>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {news.map((newsItem, index) => (
                  <NewsCard key={newsItem._id} newsItem={newsItem} index={index} />
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      {t('previous')}
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      {t('next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
