#!/bin/bash

# ParkMate Manual Setup Script (Without Docker)
# This script installs dependencies and sets up the project locally

set -e  # Exit on error

echo "🚀 ParkMate Setup Script"
echo "======================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the parkmate-app directory"
    exit 1
fi

# Check Node.js installation
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Version 18+ is recommended."
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

echo "📥 Installing backend dependencies..."
npm install

echo "✅ Backend setup complete!"
echo ""

# Setup Frontend
cd ../frontend
echo "📦 Setting up Frontend..."

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit frontend/.env with your API keys"
fi

echo "📥 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"
echo ""

cd ..

# Final instructions
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo ""
echo "1. Set up PostgreSQL database:"
echo "   createdb parkmate_db"
echo "   psql parkmate_db -c \"CREATE EXTENSION IF NOT EXISTS postgis;\""
echo "   psql parkmate_db < backend/src/database/schema.sql"
echo ""
echo "2. Start Redis (if using):"
echo "   brew services start redis"
echo ""
echo "3. Edit environment files:"
echo "   - backend/.env (add your Google Maps API key, database password)"
echo "   - frontend/.env (add your Google Maps API key)"
echo ""
echo "4. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "5. Start the frontend (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "📚 For more details, see SETUP_GUIDE.md"
