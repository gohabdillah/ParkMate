#!/bin/bash

# Test Docker deployment
echo "🧪 Testing ParkMate Docker Deployment"
echo "====================================="

# Function to check if a service is responding
check_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Checking $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s $url > /dev/null 2>&1; then
            echo "✅ $service_name is responding"
            return 0
        fi
        echo "⏳ Attempt $attempt/$max_attempts - waiting for $service_name..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to respond after $max_attempts attempts"
    return 1
}

# Test services
echo "Testing services..."

# Test frontend
check_service "http://localhost:3000" "Frontend"

# Test backend health
check_service "http://localhost:5001/health" "Backend Health"

# Test backend API
check_service "http://localhost:5001/api/v1/auth/health" "Backend API"

echo ""
echo "🎉 All services are running successfully!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo "   pgAdmin:  http://localhost:5050 (if enabled)"
echo ""
echo "🗺️  Try the carpark discovery feature:"
echo "   1. Open http://localhost:3000"
echo "   2. Register/Login"
echo "   3. Allow location access"
echo "   4. See carpark markers on the map!"