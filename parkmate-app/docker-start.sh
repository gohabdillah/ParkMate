#!/bin/bash

# ParkMate Docker Startup Script
# This script helps you start the ParkMate application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ParkMate Docker Deployment         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    if [ -f .env.docker ]; then
        echo -e "${BLUE}Creating .env from .env.docker template...${NC}"
        cp .env.docker .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env and add your GOOGLE_MAPS_API_KEY${NC}"
        echo ""
        read -p "Press Enter after you've added your API key, or Ctrl+C to exit..."
    else
        echo -e "${RED}❌ No .env.docker template found${NC}"
        exit 1
    fi
fi

# Check if GOOGLE_MAPS_API_KEY is set
if grep -q "your_google_maps_api_key_here" .env; then
    echo -e "${YELLOW}⚠️  Warning: GOOGLE_MAPS_API_KEY appears to be using the default value${NC}"
    echo -e "${YELLOW}   The application may not work correctly without a valid API key${NC}"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Clean up old containers
echo -e "${BLUE}🧹 Cleaning up old containers...${NC}"
docker-compose down -v

# Build and start services
echo -e "${BLUE}🏗️  Building Docker images...${NC}"
echo -e "${YELLOW}This may take a few minutes on first run${NC}"
docker-compose build --no-cache

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo ""
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"

# Function to check service health
check_service() {
    local service=$1
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps | grep $service | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✅ $service is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -e "${YELLOW}   Waiting for $service... ($attempt/$max_attempts)${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ $service failed to start${NC}"
    return 1
}

# Check each service
check_service "parkmate-postgres"
check_service "parkmate-redis"
check_service "parkmate-backend"
check_service "parkmate-frontend"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     🎉 ParkMate is now running! 🎉     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}        http://localhost:3000"
echo -e "${BLUE}🔧 Backend API:${NC}     http://localhost:5001"
echo -e "${BLUE}📚 API Docs:${NC}        http://localhost:5001/api-docs"
echo -e "${BLUE}🏥 Health Check:${NC}    http://localhost:5001/health"
echo -e "${BLUE}🗄️  pgAdmin:${NC}        http://localhost:5050"
echo ""
echo -e "${YELLOW}📋 Useful commands:${NC}"
echo -e "   View logs:         ${BLUE}docker-compose logs -f${NC}"
echo -e "   Stop services:     ${BLUE}docker-compose down${NC}"
echo -e "   Restart services:  ${BLUE}docker-compose restart${NC}"
echo -e "   View status:       ${BLUE}docker-compose ps${NC}"
echo ""
echo -e "${GREEN}✨ Enjoy using ParkMate!${NC}"
