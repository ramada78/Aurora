import News from "../models/newsmodel.js";
import Newsletter from "../models/newsletterModel.js";
import transporter from "../config/nodemailer.js";
import { getNewsletterTemplate } from "../email.js";

// Get all published news articles (public)
export const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, featured, lang = 'en' } = req.query;
    
    const query = { status: 'published' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (page - 1) * limit;
    
    const news = await News.find(query)
      .sort({ publishedAt: -1, featured: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(`title.${lang} content.${lang} excerpt.${lang} image category author tags featured views publishedAt`);
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all news articles for admin (includes all data and all statuses)
export const getAllNewsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search, status, lang = 'en' } = req.query;
    
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (page - 1) * limit;
    
    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      news,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching news for admin:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get a single news article by ID
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching news with ID:', id);
    
    const news = await News.findById(id);
    console.log('News found:', news ? 'Yes' : 'No');
    
    if (!news) {
      return res.status(404).json({ success: false, message: "News article not found" });
    }
    
    console.log('News object:', news);
    console.log('News views:', news.views);
    
    // Increment views by 0.5 (like properties do)
    news.views = (news.views || 0) + 0.5;
    await news.save();
    console.log('After increment - Views:', news.views);
    
    // Return full multilingual content for single article view
    const fullNews = {
      _id: news._id,
      title: news.title,
      content: news.content,
      excerpt: news.excerpt,
      image: news.image,
      category: news.category,
      author: news.author,
      tags: news.tags,
      featured: news.featured,
      views: news.views,
      publishedAt: news.publishedAt,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt
    };
    
    console.log('Full news object:', fullNews);
    res.json({ success: true, news: fullNews });
  } catch (error) {
    console.error("Error fetching news article:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create a new news article (Admin only)
export const createNews = async (req, res) => {
  try {
    const {
      title_en,
      title_ar,
      content_en,
      content_ar,
      excerpt_en,
      excerpt_ar,
      image,
      category,
      author,
      tags,
      status,
      featured
    } = req.body;
    
    const news = new News({
      title: { en: title_en, ar: title_ar },
      content: { en: content_en, ar: content_ar },
      excerpt: { en: excerpt_en, ar: excerpt_ar },
      image,
      category,
      author,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: status || 'draft',
      featured: featured === 'true'
    });
    
    const savedNews = await news.save();
    
    res.status(201).json({
      success: true,
      message: "News article created successfully",
      news: savedNews
    });
  } catch (error) {
    console.error("Error creating news article:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a news article (Admin only)
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Handle multilingual fields
    if (updateData.title_en || updateData.title_ar) {
      updateData.title = {
        en: updateData.title_en || updateData.title?.en,
        ar: updateData.title_ar || updateData.title?.ar
      };
      delete updateData.title_en;
      delete updateData.title_ar;
    }
    
    if (updateData.content_en || updateData.content_ar) {
      updateData.content = {
        en: updateData.content_en || updateData.content?.en,
        ar: updateData.content_ar || updateData.content?.ar
      };
      delete updateData.content_en;
      delete updateData.content_ar;
    }
    
    if (updateData.excerpt_en || updateData.excerpt_ar) {
      updateData.excerpt = {
        en: updateData.excerpt_en || updateData.excerpt?.en,
        ar: updateData.excerpt_ar || updateData.excerpt?.ar
      };
      delete updateData.excerpt_en;
      delete updateData.excerpt_ar;
    }
    
    // Handle tags
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }
    
    // Handle boolean fields
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true';
    }
    
    const updatedNews = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedNews) {
      return res.status(404).json({ success: false, message: "News article not found" });
    }
    
    res.json({
      success: true,
      message: "News article updated successfully",
      news: updatedNews
    });
  } catch (error) {
    console.error("Error updating news article:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a news article (Admin only)
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedNews = await News.findByIdAndDelete(id);
    
    if (!deletedNews) {
      return res.status(404).json({ success: false, message: "News article not found" });
    }
    
    res.json({
      success: true,
      message: "News article deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting news article:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Newsletter subscription
export const submitNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existingSubscription) {
      if (existingSubscription.status === 'unsubscribed') {
        // Reactivate subscription
        existingSubscription.status = 'active';
        existingSubscription.unsubscribedAt = undefined;
        await existingSubscription.save();
      } else {
        return res.status(400).json({ message: "Email already subscribed to newsletter" });
      }
    } else {
      // Create new subscription
      const newNewsletter = new Newsletter({
        email: email.toLowerCase(),
      });
      await newNewsletter.save();
    }

    // Send welcome email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to Aurora Newsletter! 🏠",
      html: getNewsletterTemplate(email),
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Newsletter subscribed successfully" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ message: "Server error" });
  }
};
