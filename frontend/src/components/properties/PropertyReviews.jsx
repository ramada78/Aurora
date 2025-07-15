import React, { useEffect, useState } from 'react';
import { getReviewsByPropertyId, addReview } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight, Star as LucideStar, StarOff as LucideStarOff } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${!readOnly ? 'hover:text-yellow-500' : ''}`}
        onClick={() => !readOnly && setRating(star)}
        disabled={readOnly}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        style={{ fontSize: 22, lineHeight: 1 }}
      >
        {star <= rating ? (
          <LucideStar fill="#facc15" stroke="#facc15" size={20} />
        ) : (
          <LucideStarOff fill="none" stroke="#d1d5db" size={20} />
        )}
      </button>
    ))}
  </div>
);

const PropertyReviews = ({ propertyId }) => {
  const { isLoggedIn, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const data = await getReviewsByPropertyId(propertyId);
      setReviews(data.filter(r => r.property_id === propertyId || r.property_id?._id === propertyId));
      setLoading(false);
    };
    fetchReviews();
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!rating) {
      setError('Please select a rating.');
      return;
    }
    setSubmitting(true);
    try {
      await addReview({
        rating,
        comment,
        property_id: propertyId,
        user_id: user._id,
      });
      setSuccess('Review submitted!');
      setRating(0);
      setComment('');
      // Refresh reviews
      const data = await getReviewsByPropertyId(propertyId);
      setReviews(data.filter(r => r.property_id === propertyId || r.property_id?._id === propertyId));
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Custom arrow components for the slider
  const ArrowButton = ({ className, style, onClick, direction }) => (
    <button
      className={`slick-arrow z-10 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition w-10 h-10 absolute top-1/2 -translate-y-1/2 ${direction === 'left' ? 'left-[-24px]' : 'right-[-24px]'} ${className}`}
      style={{ ...style, display: 'flex' }}
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous reviews' : 'Next reviews'}
      type="button"
    >
      {direction === 'left' ? <ChevronLeft size={24} color="#000" fill="#fff" /> : <ChevronRight size={24} color="#000" fill="#fff" />}
    </button>
  );

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: reviews.length > 2,
    speed: 500,
    slidesToShow: reviews.length < 2 ? 1 : 2,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <ArrowButton direction="right" />,
    prevArrow: <ArrowButton direction="left" />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-10 mt-8">
      {/* Left: Add Review */}
      <div className="pr-0 md:pr-8 border-b md:border-b-0 md:border-r border-gray-200">
        <h3 className="text-2xl font-bold mb-6 text-blue-900">Add Your Review</h3>
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Your Rating</label>
              <StarRating rating={rating} setRating={setRating} />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Comment</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience..."
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="text-gray-500">Please log in to add a review.</div>
        )}
      </div>
      {/* Right: List Reviews as Slider */}
      <div className="flex flex-col">
        <h3 className="text-2xl font-bold mb-6 text-blue-900">Property Reviews</h3>
        {loading ? (
          <div>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet for this property.</div>
        ) : (
          <Slider {...sliderSettings} className="review-slider">
            {reviews.map((review) => (
              <div key={review._id} className="px-3">
                <div className="bg-white rounded-xl shadow p-6 h-full flex flex-col justify-between border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} setRating={() => {}} readOnly />
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-800 mb-2 text-lg font-medium">{review.comment}</div>
                  <div className="text-xs text-gray-500 mt-2 font-semibold">
                    {review.user_id?.name || 'User'}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default PropertyReviews; 