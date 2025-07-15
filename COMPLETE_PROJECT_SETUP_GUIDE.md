# 🏠 Aurora - Complete Project Setup & Running Guide

<div align="center">
  <h1>🏠 Aurora</h1>
  <p><em>A comprehensive real estate platform with AI-powered insights, user management, and admin dashboard</em></p>
  
  ![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)
  ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)
  ![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express)
</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Prerequisites](#-prerequisites)
4. [Quick Start (One Command)](#-quick-start-one-command)
5. [Manual Setup](#-manual-setup)
6. [Environment Configuration](#-environment-configuration)
7. [Development Workflow](#-development-workflow)
8. [Deployment Guide](#-deployment-guide)
9. [API Documentation](#-api-documentation)
10. [Troubleshooting](#-troubleshooting)
11. [Contributing](#-contributing)

---

## 🎯 Project Overview

Aurora is a modern, full-stack real estate platform consisting of three interconnected applications:

### 🌐 **Frontend** (User Portal)
- **Port**: 5173
- **Framework**: React 18 + Vite
- **Features**: 
  - Property search and listings
  - User authentication (login/signup)
  - AI-powered property recommendations
  - Property details with image galleries
  - Appointment scheduling system
  - Contact forms and inquiries
  - SEO optimization with structured data

### 👨‍💼 **Admin Panel** (Management Dashboard)
- **Port**: 5174
- **Framework**: React 18 + Vite
- **Features**:
  - Property management (CRUD operations)
  - User management and analytics
  - Appointment scheduling and tracking
  - Real-time dashboard with statistics
  - Chart.js integration for data visualization
  - Responsive design with animations

### ⚙️ **Backend** (API Server)
- **Port**: 4000
- **Framework**: Express.js + Node.js
- **Features**:
  - RESTful API with comprehensive endpoints
  - MongoDB database integration
  - JWT authentication system
  - AI service integrations (Azure AI, OpenAI, HuggingFace)
  - Email notifications with templates
  - Image management with ImageKit
  - Rate limiting and security middleware

---

## 🏗️ System Architecture

```
Aurora Platform Architecture
├── Frontend (React + Vite) 🌐
│   ├── Port: 5173
│   ├── Public-facing website
│   ├── User authentication
│   ├── Property browsing & search
│   └── AI property recommendations
├── Admin Panel (React + Vite) 👨‍💼
│   ├── Port: 5174
│   ├── Property management
│   ├── User analytics
│   ├── Appointment tracking
│   └── Dashboard with charts
└── Backend (Express.js) ⚙️
    ├── Port: 4000
    ├── MongoDB database
    ├── JWT authentication
    ├── AI integrations
    ├── Email services
    └── Image storage
```

### Technology Stack

| **Component** | **Technology** | **Purpose** |
|---------------|----------------|-------------|
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion | User interface with smooth animations |
| **Admin** | React 18, Vite, TailwindCSS, Chart.js | Management dashboard with data visualization |
| **Backend** | Node.js, Express.js, MongoDB, JWT | API server and data management |
| **Database** | MongoDB Atlas | Cloud-based data persistence |
| **Authentication** | JWT tokens, bcrypt | Secure user authentication |
| **AI Services** | Azure AI, OpenAI, HuggingFace | Property analysis and recommendations |
| **Storage** | ImageKit | Image optimization and CDN |
| **Email** | Nodemailer + Brevo SMTP | Email notifications |
| **Styling** | TailwindCSS | Utility-first CSS framework |
| **Animations** | Framer Motion | Smooth UI animations |

---

## 🔧 Prerequisites

### Required Software
- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v7.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Required Online Services
1. **MongoDB Atlas** (Free tier available)
   - Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get connection string

2. **ImageKit** (Free tier: 20GB storage, 20GB bandwidth)
   - Sign up at [imagekit.io](https://imagekit.io/)
   - Get API keys from dashboard

3. **Brevo SMTP** (Free tier: 300 emails/day)
   - Sign up at [brevo.com](https://www.brevo.com/)
   - Get SMTP credentials

### Optional AI Services (For Enhanced Features)
- **Azure AI** - [azure.microsoft.com](https://azure.microsoft.com/en-us/services/cognitive-services/)
- **OpenAI** - [platform.openai.com](https://platform.openai.com/)
- **HuggingFace** - [huggingface.co](https://huggingface.co/)
- **FireCrawl** - [firecrawl.dev](https://firecrawl.dev/)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

---

## 🚀 Quick Start (One Command)

### Clone and Setup Everything

```bash
# Clone the repository
git clone https://github.com/AAYUSH412/Real-Estate-Website.git
cd Real-Estate-Website

# Install all dependencies for all three applications
npm run setup

# Start all services concurrently
npm run dev
```

### What This Does:
1. Installs dependencies for backend, frontend, and admin panel
2. Starts all three development servers simultaneously
3. Opens the applications on their respective ports

### Access Points:
- 🌐 **Frontend**: http://localhost:5173
- 👨‍💼 **Admin Panel**: http://localhost:5174  
- ⚙️ **Backend API**: http://localhost:4000

---

## 🔨 Manual Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/AAYUSH412/Real-Estate-Website.git
cd Real-Estate-Website
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env.local

# Edit .env.local with your actual values (see Environment Configuration section)
nano .env.local  # or use your preferred editor

# Start backend development server
npm run dev
```

**Backend will be running on: http://localhost:4000**

### Step 3: Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:4000" > .env.local

# Start frontend development server
npm run dev
```

**Frontend will be running on: http://localhost:5173**

### Step 4: Admin Panel Setup

```bash
# Open new terminal and navigate to admin
cd admin

# Install dependencies
npm install

# Create environment file
echo "VITE_BACKEND_URL=http://localhost:4000" > .env.local

# Start admin development server
npm run dev
```

**Admin Panel will be running on: http://localhost:5174**

---

## 🔐 Environment Configuration

### Backend Configuration (`backend/.env.local`)

```env
# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=4000
NODE_ENV=development
BACKEND_URL=http://localhost:4000

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Aurora?retryWrites=true&w=majority

# ===========================================
# AUTHENTICATION & SECURITY
# ===========================================
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# ===========================================
# EMAIL CONFIGURATION (Required)
# ===========================================
SMTP_USER=your_smtp_user@smtp-brevo.com
SMTP_PASS=your_smtp_password
EMAIL=your_email@gmail.com
ADMIN_EMAIL=admin@Aurora.com
ADMIN_PASSWORD=secure_admin_password_123

# ===========================================
# FRONTEND CONFIGURATION
# ===========================================
WEBSITE_URL=http://localhost:5173

# ===========================================
# IMAGE STORAGE (Local)
# ===========================================
# No external service required. Images are stored in backend/uploads/ and served via /uploads/ URLs.

# ===========================================
# AI SERVICES (Optional - for enhanced features)
# ===========================================
FIRECRAWL_API_KEY=fc-your_firecrawl_api_key_here
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here
MODEL_ID=mistralai/Mistral-7B-Instruct-v0.2
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key_here
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
AZURE_API_KEY=your_azure_api_key_here
USE_AZURE=true
```

### Frontend Configuration (`frontend/.env.local`)

```env
VITE_API_BASE_URL=http://localhost:4000
```

### Admin Panel Configuration (`admin/.env.local`)

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 🔄 Development Workflow

### Available Scripts

#### Root Level Commands
```bash
# Install all dependencies
npm run setup

# Start all services (recommended for development)
npm run dev

# Build all applications for production
npm run build

# Start only backend in production mode
npm start
```

#### Backend Commands
```bash
cd backend

# Development with hot reload
npm run dev

# Production mode
npm start

# Install dependencies only
npm install
```

#### Frontend Commands
```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

#### Admin Panel Commands
```bash
cd admin

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Development Best Practices

1. **Use Concurrent Development**: Always run `npm run dev` from the root to start all services
2. **Environment Variables**: Never commit `.env.local` files to version control
3. **Hot Reload**: All applications support hot reload for faster development
4. **Code Linting**: Run `npm run lint` before committing changes
5. **API Testing**: Backend provides a status endpoint at http://localhost:4000/status

---

## 🚀 Deployment Guide

### Backend Deployment (Render/Railway/Heroku)

1. **Environment Variables**: Set all required environment variables in your hosting platform
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Port**: The app automatically uses `process.env.PORT`

### Frontend Deployment (Vercel/Netlify)

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variables**: 
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

### Admin Panel Deployment (Vercel/Netlify)

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variables**:
   ```
   VITE_BACKEND_URL=https://your-backend-url.com
   ```

### Docker Deployment

Each application includes a `Dockerfile` for containerized deployment:

```bash
# Build and run backend
cd backend
docker build -t Aurora-backend .
docker run -p 4000:4000 Aurora-backend

# Build and run frontend
cd frontend
docker build -t Aurora-frontend .
docker run -p 5173:5173 Aurora-frontend

# Build and run admin
cd admin
docker build -t Aurora-admin .
docker run -p 5174:5174 Aurora-admin
```

---

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/forgot-password` - Password reset

### Property Endpoints
- `GET /api/products/list` - Get all properties
- `GET /api/products/single/:id` - Get single property
- `POST /api/products/add` - Add new property (Admin)
- `PUT /api/products/update/:id` - Update property (Admin)
- `DELETE /api/products/remove/:id` - Delete property (Admin)

### Appointment Endpoints
- `POST /api/appointments/schedule` - Schedule viewing
- `GET /api/appointments/user` - Get user appointments
- `GET /api/appointments/all` - Get all appointments (Admin)
- `PUT /api/appointments/status` - Update appointment status (Admin)

### Admin Endpoints
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/appointments` - Get all appointments

### AI Endpoints
- `POST /api/properties/search` - AI-powered property search
- `GET /api/locations/:city/trends` - Get location trends

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Kill process on specific port (macOS/Linux)
sudo lsof -ti:5173 | xargs kill -9
sudo lsof -ti:5174 | xargs kill -9
sudo lsof -ti:4000 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

#### 2. Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 3. Environment Variables Not Loading
- Ensure `.env.local` files are in the correct directories
- Check file names (`.env.local` not `.env`)
- Restart development servers after changing environment variables

#### 4. Database Connection Issues
- Verify MongoDB Atlas connection string
- Check network access in MongoDB Atlas dashboard
- Ensure IP address is whitelisted

#### 5. CORS Issues
- Backend is configured for development ports
- Check CORS settings in `backend/server.js`
- Ensure frontend URLs are in allowed origins

#### 6. Build Issues
```bash
# Clear Vite cache
rm -rf .vite
rm -rf dist
npm run build
```

---

## 🎯 Features Overview

### Frontend Features
- **Property Search**: Advanced filtering with location, price, type
- **User Authentication**: Secure login/signup with JWT
- **Property Details**: Comprehensive property information with image galleries
- **Appointment Booking**: Schedule property viewings
- **AI Integration**: Property recommendations and market analysis
- **SEO Optimization**: Meta tags, structured data, sitemap
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Smooth Animations**: Framer Motion for enhanced UX

### Admin Panel Features
- **Dashboard**: Real-time statistics and charts
- **Property Management**: CRUD operations for properties
- **User Management**: View and manage registered users
- **Appointment Management**: Track and update viewing appointments
- **Analytics**: Charts and graphs for business insights
- **Responsive Design**: Works on all device sizes

### Backend Features
- **RESTful API**: Comprehensive API endpoints
- **Authentication**: JWT-based secure authentication
- **File Upload**: Property image handling with ImageKit
- **Email Services**: Automated email notifications
- **AI Integration**: Multiple AI service integrations
- **Rate Limiting**: API protection against abuse
- **Error Handling**: Comprehensive error management
- **Database**: MongoDB integration with Mongoose

---

## 🧪 Testing

### Manual Testing
1. **Backend**: Visit http://localhost:4000 to see API status
2. **Frontend**: Test user registration, login, property browsing
3. **Admin**: Test property CRUD operations, dashboard
4. **Integration**: Test appointment booking end-to-end

### API Testing
Use tools like Postman or Insomnia to test API endpoints:
- Import the API documentation
- Test authentication flows
- Verify CRUD operations

---

## 📞 Support & Contributing

### Getting Help
- Check the troubleshooting section above
- Review error logs in browser console and terminal
- Ensure all environment variables are correctly set

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Project Structure
```
Aurora/
├── backend/                 # Express.js API server
│   ├── config/             # Database and service configs
│   ├── controller/         # Route handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   └── services/          # External service integrations
├── frontend/              # React user interface
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── services/      # API service functions
├── admin/                 # React admin dashboard
│   ├── src/
│   │   ├── components/    # Admin UI components
│   │   ├── pages/         # Admin pages
│   │   └── contexts/      # Admin context providers
└── package.json           # Root package with workspace scripts
```

---

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Vite** for lightning-fast development experience
- **TailwindCSS** for utility-first styling
- **MongoDB** for flexible database solutions
- **ImageKit** for image optimization
- **All contributors** who help improve this project

---

<div align="center">
  <p><strong>Happy Coding! 🚀</strong></p>
  <p>Built with ❤️ by <a href="https://github.com/AAYUSH412">Aayush Vaghela</a></p>
</div>
