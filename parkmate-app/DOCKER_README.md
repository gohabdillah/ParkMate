# ParkMate Docker Deployment - Quick Start

## ✅ What Was Fixed

Your Docker setup has been completely rebuilt with the following improvements:

### 1. **Fixed Dockerfiles**
- ✅ Backend: Added `wget` for healthchecks, fixed tsconfig.json inclusion
- ✅ Frontend: Added build arguments for environment variables, proper nginx configuration
- ✅ Both: Multi-stage builds for smaller images, proper dependency installation

### 2. **Fixed docker-compose.yml**
- ✅ Removed deprecated `version` field
- ✅ Added proper healthchecks for all services
- ✅ Added restart policies (`unless-stopped`)
- ✅ Fixed environment variable passing
- ✅ Added start periods and proper dependency conditions

### 3. **Configuration Files**
- ✅ Created `.dockerignore` files to optimize builds
- ✅ Created `.env` file with your Google Maps API key
- ✅ Updated nginx configuration for better caching and security

### 4. **Documentation**
- ✅ Created `DOCKER_GUIDE.md` with comprehensive troubleshooting
- ✅ Created `docker-start.sh` automated startup script

## 🚀 Starting Docker (3 Options)

### Option 1: Automated Script (Easiest)
```bash
cd /Users/abdi/Desktop/sweproject/2006-SCED-102/parkmate-app
./docker-start.sh
```

### Option 2: Manual Docker Compose
```bash
cd /Users/abdi/Desktop/sweproject/2006-SCED-102/parkmate-app

# Stop any local servers using the ports
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start Docker services
docker-compose up -d

# Watch logs
docker-compose logs -f
```

### Option 3: Step-by-Step Build
```bash
cd /Users/abdi/Desktop/sweproject/2006-SCED-102/parkmate-app

# Build images
docker-compose build

# Start services one by one (for debugging)
docker-compose up -d postgres redis
sleep 10
docker-compose up -d backend
sleep 20
docker-compose up -d frontend

# Check status
docker-compose ps
```

## 🔍 Verify It's Working

Once started, check these URLs:

1. **Frontend**: http://localhost:3000
2. **Backend Health**: http://localhost:5001/health
3. **API Docs**: http://localhost:5001/api-docs

## 📊 Check Service Status

```bash
# View all containers
docker-compose ps

# Should show:
# parkmate-postgres   Up (healthy)
# parkmate-redis      Up (healthy)
# parkmate-backend    Up (healthy)
# parkmate-frontend   Up

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs -f  # Follow all logs
```

## 🛠️ Common Issues & Solutions

### Issue 1: Port Already in Use
**Error**: `bind: address already in use`

**Solution**:
```bash
# Kill local development servers
lsof -ti:5001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5432 | xargs kill -9  # PostgreSQL
lsof -ti:6379 | xargs kill -9  # Redis
```

### Issue 2: Services Not Healthy
**Error**: Container keeps restarting

**Solution**:
```bash
# Check logs for specific service
docker-compose logs backend

# Common fixes:
# 1. Database not ready - wait 30 seconds
# 2. Rebuild: docker-compose build --no-cache backend
# 3. Reset: docker-compose down -v && docker-compose up -d
```

### Issue 3: Frontend Can't Connect to Backend
**Error**: API calls failing in browser

**Solution**:
1. Verify backend is running: `curl http://localhost:5001/health`
2. Check browser console for CORS errors
3. Verify `VITE_API_BASE_URL` is set to `http://localhost:5001/api/v1`

### Issue 4: Build Fails
**Error**: `npm install` or build errors

**Solution**:
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild from scratch
docker-compose build --no-cache

# If still failing, check:
# - Internet connection
# - package.json is valid
# - .dockerignore isn't excluding required files
```

## 🗂️ Project Structure

```
parkmate-app/
├── docker-compose.yml          # Main Docker configuration
├── .env                         # Environment variables (with your API key)
├── .env.docker                  # Template for .env
├── docker-start.sh              # Automated startup script
├── DOCKER_GUIDE.md              # Comprehensive guide
├── backend/
│   ├── Dockerfile               # Backend image definition
│   ├── .dockerignore            # Files to exclude from build
│   └── src/                     # Backend source code
└── frontend/
    ├── Dockerfile               # Frontend image definition
    ├── .dockerignore            # Files to exclude from build
    ├── nginx.conf               # Nginx web server config
    └── src/                     # Frontend source code
```

## 🔑 Key Files Modified

1. **docker-compose.yml** - Complete rewrite with health checks
2. **backend/Dockerfile** - Fixed tsconfig.json, added wget
3. **frontend/Dockerfile** - Added build args, improved caching
4. **backend/.dockerignore** - Removed tsconfig.json exclusion
5. **frontend/nginx.conf** - Improved caching and security headers
6. **.env** - Created with your Google Maps API key

## 📝 Environment Variables

Your `.env` file contains:
- `GOOGLE_MAPS_API_KEY` - Your existing API key (already set)
- Database credentials (postgres/postgres123)
- JWT secrets (change in production!)
- CORS settings
- API URLs

## 🎯 Next Steps

1. Start Docker: `./docker-start.sh` or `docker-compose up -d`
2. Wait for all services to be healthy (30-60 seconds)
3. Open http://localhost:3000 in your browser
4. Test the application with your existing features

## 🔄 Switching Between Local & Docker

### To Use Local Development:
```bash
# Stop Docker
docker-compose down

# Start local servers
cd backend && npm run dev
cd frontend && npm run dev
```

### To Use Docker:
```bash
# Stop local servers (Ctrl+C in each terminal)

# Start Docker
docker-compose up -d
```

## 📚 Additional Resources

- Full troubleshooting guide: See `DOCKER_GUIDE.md`
- Docker Compose docs: https://docs.docker.com/compose/
- Project README: `README.md`

## ⚠️ Important Notes

1. **First build takes 5-10 minutes** - Docker downloads base images and installs all dependencies
2. **Subsequent builds are faster** - Docker caches layers
3. **Volumes persist data** - Database and Redis data survives container restarts
4. **Clean reset**: `docker-compose down -v` removes all data

## 🎉 Success Indicators

When everything is working, you should see:

```bash
$ docker-compose ps

NAME                  STATUS
parkmate-backend      Up (healthy)
parkmate-frontend     Up
parkmate-postgres     Up (healthy)
parkmate-redis        Up (healthy)
```

And these URLs should work:
- ✅ http://localhost:3000 - Shows ParkMate app
- ✅ http://localhost:5001/health - Returns `{"success":true}`
- ✅ http://localhost:5001/api-docs - Shows Swagger API docs

---

**Need Help?**
- Check `DOCKER_GUIDE.md` for detailed troubleshooting
- View logs: `docker-compose logs -f`
- Reset everything: `docker-compose down -v && docker-compose up -d`
