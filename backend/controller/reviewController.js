import Review from '../models/Review.js';

export const listReviews = async (req, res) => {
  try {
    const { property_id } = req.query;
    
    // Build query object
    const query = {};
    if (property_id) {
      query.property_id = property_id;
    }
    
    const reviews = await Review.find(query)
      .populate({
        path: 'property_id',
        populate: { path: 'city', select: 'city_name' }
      })
      .populate('user_id');
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment, property_id, user_id } = req.body;
    const review = new Review({ rating, comment, property_id, user_id });
    await review.save();
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.findByIdAndUpdate(id, { rating, comment }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}; 