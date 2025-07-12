# BuildEstate Backend

> Backend API server for the BuildEstate real estate platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.9+-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# Then start the development server
npm run dev
```

Server will be running at `http://localhost:4000`

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (Atlas or local)
- npm or yarn

## 🔧 Configuration

1. **Database**: Add your MongoDB connection string to `.env.local`
2. **JWT**: Set a secure JWT secret
3. **Email**: Configure SMTP settings for notifications
4. **AI Services**: Optional - add API keys for AI-powered features

## 📡 API Endpoints

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login  
- `GET /api/products` - Get properties
- `POST /api/properties/search` - AI property search
- `POST /api/appointments` - Book appointment
- `GET /api/admin/stats` - Admin dashboard

## 🛠️ Scripts

```bash
npm run dev     # Development with auto-reload
npm start       # Production server
npm run build   # Build for deployment
```

## 🐳 Docker

```bash
# Using Docker Compose
docker-compose up --build

# Using Docker directly  
docker build -t buildestate-backend .
docker run -p 4000:4000 --env-file .env.local buildestate-backend
```

## 📚 Documentation

- **[Complete Documentation](../BACKEND_DOCUMENTATION.md)** - Comprehensive setup guide
- **[API Testing Guide](../API_TESTING_GUIDE.md)** - Test all endpoints
- **[Environment Variables](.env.example)** - Configuration reference

## 🏗️ Project Structure

```
backend/
├── config/          # Configuration files
├── controller/      # Request handlers  
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── uploads/         # File uploads
└── server.js        # Main application
```

## 🔍 Features

- **Authentication**: JWT-based user auth
- **AI Search**: Intelligent property search
- **Email**: Automated notifications
- **File Upload**: Image handling with local uploads directory
- **Security**: Rate limiting, CORS, validation
- **Admin Panel**: Management dashboard

## 🚀 Deployment

The backend is configured for easy deployment on:

- **Render** (recommended)
- **Vercel** 
- **Railway**
- **Docker** containers

## 📞 Support

- Check the [troubleshooting guide](../BACKEND_DOCUMENTATION.md#-troubleshooting)
- Open an issue on GitHub
- Run `./setup.sh` for automated setup

---

Built with ❤️ for BuildEstate
