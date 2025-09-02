import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  content: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  excerpt: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['buying', 'selling', 'investment', 'tips', 'market_trends', 'real_estate'],
    default: 'real_estate'
  },
  author: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
newsSchema.index({ 'title.en': 'text', 'title.ar': 'text', 'content.en': 'text', 'content.ar': 'text' });
newsSchema.index({ category: 1, status: 1, featured: 1 });
newsSchema.index({ publishedAt: -1 });

const News = mongoose.model('News', newsSchema);

export default News;