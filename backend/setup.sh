#!/bin/bash

# BuildEstate Backend Quick Setup Script
# This script helps you set up the BuildEstate backend quickly

echo "🏠 BuildEstate Backend Setup"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Navigate to backend directory if we're in the root
if [ -d "backend" ]; then
    echo "📁 Navigating to backend directory..."
    cd backend
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the backend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Set up environment file
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "✅ .env.local created successfully"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env.local and add your actual configuration values:"
        echo "   - MongoDB connection string"
        echo "   - JWT secret"
        echo "   - Email configuration"
        echo "   - Other API keys as needed"
        echo ""
    else
        echo "⚠️  .env.example not found. Please create .env.local manually."
    fi
else
    echo "✅ .env.local already exists"
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
    echo "✅ Uploads directory created"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env.local with your configuration"
echo "   2. Ensure MongoDB is running (local or Atlas)"
echo "   3. Run 'npm run dev' to start the development server"
echo "   4. Server will be available at http://localhost:4000"
echo ""
echo "🔧 Available commands:"
echo "   npm run dev    - Start development server with auto-reload"
echo "   npm start      - Start production server"
echo "   npm run build  - Build for production"
echo ""
echo "📚 For detailed documentation, see BACKEND_DOCUMENTATION.md"
echo ""

# Check if MongoDB is running locally (optional check)
if command -v mongod &> /dev/null; then
    if pgrep mongod > /dev/null; then
        echo "✅ MongoDB is running locally"
    else
        echo "⚠️  MongoDB is not running locally (you may be using Atlas)"
    fi
fi

echo "Happy coding! 🚀"
