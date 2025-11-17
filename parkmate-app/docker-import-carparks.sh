#!/bin/bash

# Import Carparks Data into Docker Container
# This script runs the carpark import inside the Docker backend container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   ParkMate Carpark Data Import         ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again${NC}"
    exit 1
fi

# Check if backend container is running
if ! docker-compose ps | grep parkmate-backend | grep -q "Up"; then
    echo -e "${RED}❌ Error: Backend container is not running${NC}"
    echo -e "${YELLOW}Start Docker containers first:${NC}"
    echo -e "   ${BLUE}docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo -e "${GREEN}✅ Backend container is running${NC}"
echo ""

# Check if database is ready
echo -e "${BLUE}📊 Checking database connection...${NC}"
if docker-compose exec -T backend wget -q --spider http://localhost:5000/health; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed, but continuing...${NC}"
fi
echo ""

# Run the import script
echo -e "${BLUE}🚀 Starting carpark data import...${NC}"
echo -e "${YELLOW}This may take a few minutes depending on the amount of data${NC}"
echo ""

# Execute the import script in the container
docker-compose exec backend node dist/scripts/importCarparks.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ✅ Import completed successfully!    ${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}You can verify the data:${NC}"
    echo -e "   ${BLUE}docker-compose exec postgres psql -U postgres -d parkmate_db -c 'SELECT COUNT(*) FROM carparks;'${NC}"
else
    echo ""
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}   ❌ Import failed!                     ${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Check the logs for errors:${NC}"
    echo -e "   ${BLUE}docker-compose logs backend${NC}"
    exit 1
fi
