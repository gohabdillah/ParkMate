#!/bin/bash

echo "🧪 Quick ParkMate Docker Test"
echo "==============================="

# Test Backend Health
echo "⏳ Testing Backend Health..."
BACKEND_HEALTH=$(curl -s http://localhost:5001/health | grep -o '"success":true' || echo "Failed")
if [[ "$BACKEND_HEALTH" == '"success":true' ]]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Test Database Connection
echo "⏳ Testing Database..."
DB_COUNT=$(docker-compose exec -T postgres psql -U postgres -d parkmate_db -c "SELECT COUNT(*) FROM carparks;" 2>/dev/null | grep -o '[0-9]\+' | head -1)
if [[ "$DB_COUNT" -gt 2000 ]]; then
    echo "✅ Database has $DB_COUNT carparks"
else
    echo "❌ Database connection or data issue"
    exit 1
fi

# Test Frontend
echo "⏳ Testing Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000)
if [[ "$FRONTEND_STATUS" == "200" ]]; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend not accessible (Status: $FRONTEND_STATUS)"
fi

echo ""
echo "🎉 Docker deployment is working!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Ready for teammates to use with:"
echo "git clone <repo>"
echo "cd parkmate-app"
echo "docker-compose up -d"