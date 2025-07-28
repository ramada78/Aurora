import { useState } from 'react';
import { Calendar, ArrowRight, ArrowLeft, Clock, Share2, Bookmark, BookmarkCheck, Search, Tag, ExternalLink, ChevronRight, ChevronLeft, TrendingUp, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogPosts } from '../assets/blogdata';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// Animation variants
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

// BlogCard component
const BlogCard = ({ post }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [views] = useState(Math.floor(Math.random() * 1000) + 100);

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: isRTL ? (post.title_ar || post.title) : post.title,
          text: isRTL ? (post.excerpt_ar || post.excerpt) : post.excerpt,
          url: post.link
        });
        toast.success(t('post_shared_successfully'), {
          style: { borderRadius: '12px', background: '#10B981', color: '#fff' }
        });
      } else {
        await navigator.clipboard.writeText(post.link);
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

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    
    if (!isBookmarked) {
      toast.success(t('saved_to_reading_list', { title: isRTL ? (post.title_ar || post.title) : post.title }), {
        style: { borderRadius: '12px', background: '#3B82F6', color: '#fff' }
      });
    } else {
      toast.info(t('removed_from_reading_list', { title: isRTL ? (post.title_ar || post.title) : post.title }), {
        style: { borderRadius: '12px', background: '#6B7280', color: '#fff' }
      });
    }
  };

  const handleReadMore = () => {
    window.open(post.link, '_blank', 'noopener,noreferrer');
  };

  const estimatedReadTime = Math.ceil((isRTL ? (post.excerpt_ar || post.excerpt) : post.excerpt).split(' ').length / 200);
  
  // Extract category from post (or use default)
  const category = post.category || t('real_estate');

  // Map of known categories to translation keys
  const categoriesMap = {
    real_estate: t('real_estate'),
    buying: t('buying'),
    selling: t('selling'),
    investment: t('investment'),
    tips: t('tips'),
    market_trends: t('market_trends'),
  };
  const categoryKey = post.category || 'real_estate';
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
          src={post.image}
          alt={isRTL ? (post.title_ar || post.title) : post.title}
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
          {views}
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

        <div className="absolute top-6 right-6 flex flex-col gap-3">
          <motion.button
            whileTap={pulseAnimation}
            onClick={handleBookmark}
            className={`p-3 backdrop-blur-md rounded-full shadow-lg border border-white/20 transition-all duration-300
              ${isBookmarked 
                ? 'bg-blue-600 text-white shadow-blue-500/25' 
                : 'bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </motion.button>
          
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
              <span className="font-medium">{post.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-green-500`} />
              <span className="font-medium">{estimatedReadTime} {t('min_read')}</span>
            </div>
          </div>
          <div className="flex items-center text-orange-500">
            <TrendingUp className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            <span className="text-xs font-medium">{t('trending')}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
          {isRTL ? (post.title_ar || post.title) : post.title}
        </h3>
        
        <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
          {isRTL ? (post.excerpt_ar || post.excerpt) : post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
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

// Main Blog component
const Blog = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Use category keys, not translated labels
  const categories = [
    { key: 'all', label: t('all') },
    { key: 'buying', label: t('buying') },
    { key: 'selling', label: t('selling') },
    { key: 'investment', label: t('investment') },
    { key: 'tips', label: t('tips') },
    { key: 'market_trends', label: t('market_trends') },
    { key: 'real_estate', label: t('real_estate') },
  ];
  
  // Filtering logic uses keys
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = (i18n.language === 'ar'
      ? (post.title_ar || post.title)
      : post.title
    ).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i18n.language === 'ar'
        ? (post.excerpt_ar || post.excerpt)
        : post.excerpt
      ).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (post.category || 'real_estate') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-32 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-4 h-4" />
            {t('latest_real_estate_insights')}
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 relative">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('expert_insights')}
            </span>
            <br />
            <span className="text-gray-900">& {t('market_updates')}</span>
            <motion.div 
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('stay_ahead_of_market')}
          </p>
        </motion.div>
        
        {/* Enhanced Search and filter section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
            <div className="relative max-w-md w-full">
              <motion.div
                className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}
              >
                <input
                  type="text"
                  placeholder={t('search_articles_topics_tips')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/80 backdrop-blur-sm shadow-lg text-gray-900 placeholder-gray-500"
                />
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </motion.button>
                )}
              </motion.div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
              {categories.map((cat, index) => (
                <motion.button
                  key={cat.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg ${
                    selectedCategory === cat.key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 transform scale-105'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {filteredPosts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={{...post, id: String(post.id)}} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center"
              >
                <Search className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{t('no_articles_found')}</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                {`${t('couldnt_find_any_articles')}`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {t('clear_filters')}
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Enhanced View all articles button */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl 
              shadow-2xl hover:shadow-blue-500/25 transition-all font-bold text-lg inline-flex items-center group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              {t('explore_all_articles')}
              {isRTL ? <ArrowLeft className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform duration-300" /> : <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
          
          <p className="text-gray-500 mt-4 text-sm">
            {t('join_thousands_of_readers')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// PropTypes for BlogCard component
BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default Blog;