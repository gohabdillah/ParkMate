#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Restarting ParkMate Backend Server...${NC}"

# Kill any existing processes on port 5001
echo -e "${YELLOW}📍 Stopping existing server on port 5001...${NC}"
lsof -ti:5001 | xargs kill -9 2>/dev/null

# Also kill nodemon and ts-node processes
pkill -f "nodemon.*parkmate" 2>/dev/null
pkill -f "ts-node.*parkmate" 2>/dev/null

sleep 2

# Navigate to backend directory
cd "$(dirname "$0")"

# Start the server
echo -e "${GREEN}🚀 Starting backend server...${NC}"
npm run dev &

# Wait for server to start
echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
sleep 5

# Test if server is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✅ Server started successfully!${NC}"
    echo ""
    echo -e "${GREEN}📚 API Documentation: ${NC}http://localhost:5001/api-docs"
    echo -e "${GREEN}🏥 Health Check: ${NC}http://localhost:5001/health"
    echo -e "${GREEN}🔌 API Endpoint: ${NC}http://localhost:5001/api/v1"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "   - Clear browser cache before opening Swagger"
    echo "   - Use Incognito/Private mode if SSL errors persist"
    echo "   - Make sure to use HTTP (not HTTPS)"
    echo ""
    echo -e "${YELLOW}📖 For SSL errors, read: ${NC}backend/SWAGGER_FIX.md"
else
    echo -e "${RED}❌ Server failed to start${NC}"
    echo -e "${YELLOW}Check the logs above for errors${NC}"
fi
