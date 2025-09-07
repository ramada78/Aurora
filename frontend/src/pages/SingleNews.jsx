import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  Tag, 
  Eye, 
  ArrowLeft, 
  Clock, 
  Share2, 
  TrendingUp,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon
} from 'lucide-react';
import { Backendurl } from '../App';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const SingleNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState([]);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchNewsItem();
  }, [id]);

  // Handle language changes without refetching the article
  useEffect(() => {
    if (newsItem && newsItem.category) {
      fetchRelatedNews(newsItem.category, newsItem._id);
    }
  }, [i18n.language, newsItem]);

    const fetchNewsItem = async () => {
    try {
      setLoading(true);
      
      // For testing: always increment views (no edit parameter)
      const response = await axios.get(`${Backendurl}/api/news/news/${id}`);
      
      if (response.data.success) {
        console.log('Frontend received news:', response.data.news);
        console.log('Views in response:', response.data.news.views);
        setNewsItem(response.data.news);
      }
    } catch (error) {
      console.error('Error fetching news item:', error);
      toast.error(t('error_loading_article'));
    } finally {
      setLoading(false);
    }
  };





  const fetchRelatedNews = async (category, currentId) => {
    try {
      const response = await axios.get(`${Backendurl}/api/news/news?category=${category}&limit=3&lang=${i18n.language}`);
      if (response.data.success) {
        const filtered = response.data.news.filter(item => item._id !== currentId);
        setRelatedNews(filtered.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related news:', error);
    }
  };



  const handleShare = async (platform = 'native') => {
    try {
      const shareData = {
        title: getLocalizedTitle(newsItem),
        text: getLocalizedExcerpt(newsItem),
        url: window.location.href
      };

      if (platform === 'native' && navigator.share) {
        await navigator.share(shareData);
        toast.success(t('post_shared_successfully'), {
          style: { borderRadius: '12px', background: '#10B981', color: '#fff' }
        });
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getLocalizedTitle(newsItem))}&url=${encodeURIComponent(window.location.href)}`, '_blank');
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
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

  const getLocalizedTitle = (item) => {
    if (!item) return '';
    return i18n.language === 'ar' ? (item.title?.ar || item.title?.en) : (item.title?.en || item.title?.ar);
  };

  const getLocalizedExcerpt = (item) => {
    if (!item) return '';
    return i18n.language === 'ar' ? (item.excerpt?.ar || item.excerpt?.en) : (item.excerpt?.en || item.excerpt?.ar);
  };

  const getLocalizedContent = (item) => {
    if (!item) return '';
    return i18n.language === 'ar' ? (item.content?.ar || item.content?.en) : (item.content?.en || item.content?.ar);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimatedReadTime = (content) => {
    if (!content) return 0;
    return Math.ceil(content.split(' ').length / 200);
  };

  // Map of known categories to translation keys
  const categoriesMap = {
    real_estate: t('real_estate'),
    buying: t('buying'),
    selling: t('selling'),
    investment: t('investment'),
    tips: t('tips'),
    market_trends: t('market_trends'),
  };

  const getCategoryLabel = (category) => {
    if (!category) return '';
    const categoryKey = category.toLowerCase();
    return categoriesMap[categoryKey] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading_article')}</p>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('article_not_found')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('article_not_found_description')}
          </p>
          <button
            onClick={() => navigate('/news')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('back_to_news')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      {/* Back Button */}
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back_to_news')}
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Hero Image */}
            <div className="relative h-96 md:h-[500px] overflow-hidden">
              <img
                src={newsItem.image?.startsWith('/uploads/') ? `${Backendurl}${encodeURI(newsItem.image)}` : newsItem.image}
                alt={getLocalizedTitle(newsItem)}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
                             {/* Category Badge */}
               <div className="absolute top-6 left-6">
                 <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg">
                   {getCategoryLabel(newsItem.category)}
                 </span>
               </div>

              {/* Action Buttons */}
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => handleShare('native')}
                  className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-blue-50 transition-all duration-300 shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Article Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-6 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(newsItem.publishedAt || newsItem.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{estimatedReadTime(getLocalizedContent(newsItem))} {t('min_read')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{newsItem.views || 0} {t('views')}</span>
                  </div>
                  {newsItem.featured && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>{t('trending')}</span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {getLocalizedTitle(newsItem)}
                </h1>
                
                <p className="text-lg text-gray-200 leading-relaxed">
                  {getLocalizedExcerpt(newsItem)}
                </p>
              </div>
            </div>

            {/* Article Body */}
            <div className="p-8">
              {/* Author Info */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {newsItem.author?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{newsItem.author}</p>
                  <p className="text-sm text-gray-600">{t('author')}</p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed text-base"
                  dangerouslySetInnerHTML={{ __html: getLocalizedContent(newsItem) }}
                />
              </div>

              {/* Tags */}
              {newsItem.tags && newsItem.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tags')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {newsItem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('share_article')}</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Related Articles */}
          {relatedNews.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('related_articles')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate(`/news/${item._id}`)}
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.image?.startsWith('/uploads/') ? `${Backendurl}${encodeURI(item.image)}` : item.image}
                        alt={getLocalizedTitle(item)}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                                         <div className="p-4">
                       <span className="text-xs text-blue-600 font-medium">{getCategoryLabel(item.category)}</span>
                       <h3 className="text-lg font-semibold text-gray-900 mt-2 line-clamp-2">
                        {getLocalizedTitle(item)}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {getLocalizedExcerpt(item)}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                        <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                        <span>{item.views || 0} {t('views')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleNews;
