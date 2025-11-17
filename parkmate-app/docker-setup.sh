#!/bin/bash

# ParkMate Docker Setup Script
# This script helps teammates get the ParkMate app running with Docker

set -e

echo "🅿️  ParkMate Docker Setup"
echo "========================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Backend .env created from example"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
    echo "✅ Frontend .env created from example"
fi

# Choose environment
echo ""
echo "Choose deployment type:"
echo "1) Development (with hot reload)"
echo "2) Production (optimized build)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo "🔧 Starting development environment..."
        docker-compose -f docker-compose.dev.yml down --volumes
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    2)
        echo "🚀 Starting production environment..."
        docker-compose down --volumes
        docker-compose up --build
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac