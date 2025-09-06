# API Setup Guide for Flutter Development

## Base URL Configuration

For this project, the application runs locally only. Use the following base URL:

**Base URL**: `http://localhost:4000`

## API Endpoints

All API endpoints follow this pattern:
- `http://localhost:4000/api/[endpoint]`

### Available Endpoints:

#### **Authentication & Users** (`/api/users`)
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `POST /api/users/forgot` - Forgot password
- `POST /api/users/reset/:token` - Reset password
- `POST /api/users/admin` - Admin login
- `GET /api/users/me` - Get current user
- `GET /api/users/roles` - Get user roles
- `GET /api/users/wishlist` - Get user wishlist
- `GET /api/users/notifications` - Get notifications
- `PUT /api/users/notifications/read` - Mark notifications as read
- `DELETE /api/users/notifications` - Clear all notifications
- `POST /api/users/last-search` - Save last search
- `GET /api/users/last-search` - Get last searches
- `POST /api/users/wishlist/add` - Add to wishlist
- `POST /api/users/wishlist/remove` - Remove from wishlist
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/all-with-roles` - Get all users with roles (agent/admin only)
- `POST /api/users/create-with-role` - Create user with role (admin only)
- `PUT /api/users/update-with-role` - Update user with role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

#### **Properties** (`/api/properties`)
- `POST /api/properties/search` - Search properties
- `POST /api/properties/recommend` - AI property recommendations
- `GET /api/locations/:city/trends` - Location trends

#### **Products** (`/api/products`)
- `POST /api/products/add` - Add property (agent/seller only)
- `GET /api/products/list` - List properties
- `GET /api/products/single/:id` - Get single property
- `POST /api/products/remove` - Remove property (agent/seller only)
- `POST /api/products/update` - Update property (agent/seller only)
- `GET /api/products/amenities` - List amenities
- `POST /api/products/amenities/seed` - Seed amenities data
- `GET /api/products/total-views` - Property views stats
- `GET /api/products/views-over-time` - Views over time
- `GET /api/products/status-distribution` - Status distribution

#### **Appointments** (`/api/appointments`)
- `POST /api/appointments/schedule` - Schedule viewing
- `GET /api/appointments/user` - Get user appointments
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/all` - Get all appointments
- `GET /api/appointments/stats` - Appointment statistics
- `PUT /api/appointments/cancel/:id` - Cancel appointment
- `PUT /api/appointments/feedback/:id` - Submit feedback
- `PUT /api/appointments/status` - Update status
- `PUT /api/appointments/update-meeting` - Update meeting link
- `PUT /api/appointments/update-details` - Update details

#### **Reviews** (`/api/reviews`)
- `GET /api/reviews` - List all reviews
- `GET /api/reviews/property/:propertyId` - Get reviews by property ID
- `POST /api/reviews` - Add review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

#### **Agents** (`/api/agents`)
- `GET /api/agents` - List agents
- `POST /api/agents` - Add agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

#### **Clients** (`/api/clients`)
- `GET /api/clients` - List clients
- `POST /api/clients` - Add client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### **Sellers** (`/api/sellers`)
- `GET /api/sellers` - List sellers
- `POST /api/sellers` - Add seller
- `PUT /api/sellers/:id` - Update seller
- `DELETE /api/sellers/:id` - Delete seller

#### **Cities** (`/api/cities`)
- `GET /api/cities` - List cities
- `POST /api/cities` - Add city
- `PUT /api/cities/:id` - Update city
- `DELETE /api/cities/:id` - Delete city

#### **Property Types** (`/api/property-types`)
- `GET /api/property-types` - List property types
- `POST /api/property-types` - Add property type
- `PUT /api/property-types/:id` - Update property type
- `DELETE /api/property-types/:id` - Delete property type
- `GET /api/property-types/counts` - Get property type counts

#### **Amenities** (`/api/amenities`)
- `GET /api/amenities` - List amenities
- `GET /api/amenities/:id` - Get amenity by ID
- `POST /api/amenities` - Add amenity
- `PUT /api/amenities/:id` - Update amenity
- `DELETE /api/amenities/:id` - Delete amenity

#### **Transactions** (`/api/transactions`)
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Add transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/count/completed` - Count completed transactions

#### **Forms** (`/api/forms`)
- `POST /api/forms/submit` - Submit contact form (public)
- `GET /api/forms/admin` - Get all forms with filtering and pagination (admin only)
- `GET /api/forms/admin/stats` - Get form statistics (admin only)
- `GET /api/forms/admin/:id` - Get single form by ID (admin only)
- `PUT /api/forms/admin/:id` - Update form status, priority, assignment (admin only)
- `POST /api/forms/admin/:id/reply` - Add reply to form (admin only)
- `DELETE /api/forms/admin/:id` - Delete form (admin only)

#### **News** (`/api/news`)
- `GET /api/news/news` - Get all published news articles (public)
- `GET /api/news/admin/news` - Get all news articles for admin (includes all data and statuses)
- `GET /api/news/news/:id` - Get single news article by ID
- `POST /api/news/news` - Create new news article (admin only)
- `PUT /api/news/news/:id` - Update news article (admin only)
- `DELETE /api/news/news/:id` - Delete news article (admin only)
- `POST /api/news/newsletter` - Submit newsletter subscription

#### **Admin** (`/api/admin`)
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/appointments` - All appointments
- `PUT /api/admin/appointments/status` - Update appointment status
- `PUT /api/admin/appointments/update-meeting` - Update meeting link
- `PUT /api/admin/appointments/update-details` - Update appointment details
- `GET /api/admin/users` - Get all users with roles
- `POST /api/admin/users` - Create user with role
- `PUT /api/admin/users/:id` - Update user with role
- `DELETE /api/admin/users/:id` - Delete user

#### **System Endpoints**
- `GET /api/stats/public` - Public statistics (no auth required)
- `GET /status` - Health check
- `GET /` - API status page

------------------------------------------------

## Development Setup

### Backend (Node.js/Express)
- **Port**: 4000
- **URL**: `http://localhost:4000`
- **Start Command**: `npm run dev` (in backend directory)

### Frontend (React)
- **Port**: 5173
- **URL**: `http://localhost:5173`
- **Start Command**: `npm run dev` (in frontend directory)

### Admin Panel
- **Port**: 5174
- **URL**: `http://localhost:5174`
- **Start Command**: `npm run dev` (in admin directory)

## Authentication

The API uses JWT tokens for authentication:
- Include `Authorization: Bearer <token>` header in requests
- Token is returned from login endpoint: `POST /api/users/login`

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Frontend - Vite default)
- `http://localhost:5174` (Admin panel)
- `http://localhost:4000` (Backend API)

## File Uploads

Uploaded files are served from:
- `http://localhost:4000/uploads/[filename]`

## Health Check

Test if the API is running:
- `GET http://localhost:4000/status`

## Important Notes

### **Authentication Requirements**
- Most endpoints require JWT authentication via `Authorization: Bearer <token>` header
- Admin-only endpoints are marked with "(admin only)"
- Role-based access is indicated where applicable (agent/seller only)

### **File Uploads**
- Property images are uploaded via multipart/form-data
- Supported image fields: `image1`, `image2`, `image3`, `image4`
- Files are served from `/uploads/[filename]`

### **Development Setup**
- No production deployment required
- All URLs use localhost for simplicity
- Database runs locally (MongoDB)
- Rate limiting: 500 requests per 15 minutes per IP
