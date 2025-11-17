# 🅿️ ParkMate - Smart Parking Solution

A comprehensive parking application that helps users find, compare, and book parking spots with real-time availability, smart filtering, and cost estimation.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Team Guidelines](#team-guidelines)
- [Deployment](#deployment)

## 🎯 Project Overview

**ParkMate** is a full-stack parking management application that provides:

- 🔍 **Smart Search**: Find parking spots by location, price, or availability
- 🗺️ **Interactive Maps**: Visual representation using Google Maps integration
- 🎯 **Advanced Filtering**: Filter by height, EV chargers, sheltered parking, night parking
- ⭐ **Favorites**: Save frequently used parking locations
- 📊 **Live Availability**: Real-time parking spot availability
- 💰 **Cost Estimation**: Calculate parking costs based on duration
- 👤 **User Management**: Secure authentication and user profiles

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────┐
│   Client    │ (React + TypeScript)
│  (Browser)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────────┐
│         API Gateway (Express)           │
└─────────────────────────────────────────┘
       │
       ├──► Authentication Service
       ├──► Carpark Service
       ├──► User Service
       ├──► Favorites Service
       └──► History Service
       │
       ▼
┌──────────────┐    ┌────────────┐
│  PostgreSQL  │    │   Redis    │
│  + PostGIS   │    │   Cache    │
└──────────────┘    └────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      External APIs                      │
│  - Google Maps API                      │
│  - Geocoding API                        │
│  - Carpark Data API                     │
│  - Carpark Availability Data API        │
|                                         │
└─────────────────────────────────────────┘
```

### Design Patterns Used

- **Repository Pattern**: Data access layer abstraction
- **Service Layer Pattern**: Business logic separation
- **Controller Pattern**: Request handling
- **Dependency Injection**: Loose coupling
- **Middleware Pattern**: Cross-cutting concerns

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI)
- **Maps**: Google Maps React
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 15 + PostGIS
- **Cache**: Redis 7
- **Authentication**: JWT
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database Management**: pgAdmin 
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky

## 🚀 Getting Started

### Prerequisites

**For Docker Setup (Recommended):**
- Docker Desktop installed and running ([Download here](https://www.docker.com/products/docker-desktop))
- Git installed
- A Google Maps API key ([Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key))

**For Local Setup:**
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 15+
- Redis 7+
- Git installed
- A Google Maps API key

---

## 📦 Setup Instructions

### 2.6.1 Front-End Set Up

#### 1. Install Prerequisites

**For Web Development (No Emulator Needed)**
- This is a web application that runs in your browser
- No mobile emulators required

#### 2. Create Environment File

Navigate to the frontend folder and create a `.env` file:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` and fill in the respective fields. The `VITE_API_BASE_URL` environment variable indicates the backend API path.

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api/v1

# Google Maps API Key (Required)
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# App Configuration
VITE_APP_NAME=ParkMate
VITE_APP_VERSION=1.0.0
```

#### 3. Install Required Packages

```bash
npm install
```

#### 4. Run the Front-End

**Development Mode:**
```bash
npm run dev
```

The frontend should now be running on **http://localhost:5173** (Vite default) or **http://localhost:3000**.

**Production Build:**
```bash
npm run build
npm run preview
```

---

### 2.6.2 Back-End Set Up

#### 1. Install Node.js

Download and install **Node.js 18+** from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

#### 2. Install Database Services

**PostgreSQL:**
- **macOS**: `brew install postgresql@15`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)
- **Linux**: `sudo apt install postgresql-15`

---

## 📁 3. Project Structure

```
parkmate-app/
├── backend/                    # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── modules/           # Feature modules (modular architecture)
│   │   │   ├── auth/          # Authentication module
│   │   │   │   ├── auth.controller.ts    # Request handlers
│   │   │   │   ├── auth.service.ts        # Business logic
│   │   │   │   ├── auth.repository.ts     # Database queries
│   │   │   │   ├── auth.routes.ts         # Route definitions
│   │   │   │   ├── auth.types.ts          # TypeScript types
│   │   │   │   └── auth.validation.ts     # Request validation
│   │   │   ├── carpark/       # Carpark management module
│   │   │   ├── user/          # User profile module
│   │   │   ├── favorites/     # Favorites module
│   │   │   ├── history/       # Search history module
│   │   │   └── feedback/      # User feedback module
│   │   ├── shared/            # Shared utilities
│   │   │   ├── middleware/    # Express middleware (auth, error handling, rate limiting)
│   │   │   └── utils/         # Utility functions
│   │   ├── integrations/      # External API integrations (Singapore data.gov.sg)
│   │   ├── config/            # Configuration (database, Redis, environment)
│   │   ├── database/          # Database schemas & migrations
│   │   │   ├── schema_no_postgis.sql     # Main database schema
│   │   │   └── migrations/               # Database migrations
│   │   ├── scripts/           # Utility scripts (carpark import, etc.)
│   │   └── server.ts          # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env                   # Environment variables (not in git)
│
├── frontend/                   # Frontend React app (Vite + TypeScript)
│   ├── src/
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Authentication UI
│   │   │   ├── carpark/       # Carpark search & display
│   │   │   ├── filters/       # Search filters
│   │   │   ├── favorites/     # Favorites management
│   │   │   └── settings/      # User settings
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx       # Main map page
│   │   │   └── SettingsPage.tsx
│   │   ├── shared/            # Shared components (navbar, footer, etc.)
│   │   ├── services/          # API client services
│   │   │   ├── apiClient.ts   # Axios instance
│   │   │   ├── authService.ts # Authentication service
│   │   │   └── geolocationService.ts
│   │   ├── store/             # Redux store configuration
│   │   ├── App.tsx            # Root component
│   │   ├── main.tsx           # Application entry point
│   │   └── theme.ts           # Material-UI theme
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── .env                   # Environment variables (not in git)
│
├── docker-compose.yml         # Docker orchestration
└── docker-import-carparks.sh  # Helper script for Docker carpark import
```

### Module Architecture

Each backend module follows a consistent pattern:
- **Controller**: Handles HTTP requests/responses
- **Service**: Contains business logic
- **Repository**: Manages database operations
- **Routes**: Defines API endpoints
- **Types**: TypeScript type definitions
- **Validation**: Request validation schemas

---

## 📚 5. API Documentation

### 5.1 Access Swagger UI

Once the backend is running, visit:
- **Local Development**: http://localhost:5001/api-docs
- **Docker**: http://localhost:5001/api-docs

### 5.2 API Endpoints Overview

#### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

#### Carpark Endpoints
- `GET /api/v1/carparks` - List carparks with filters (pagination, search, location)
- `GET /api/v1/carparks/:id` - Get carpark details
- `GET /api/v1/carparks/nearby` - Get nearby carparks (requires lat/lng)
- `POST /api/v1/carparks/:id/calculate-cost` - Calculate parking cost

#### Favorites Endpoints
- `GET /api/v1/favorites` - Get user's favorite carparks
- `POST /api/v1/favorites` - Add carpark to favorites
- `DELETE /api/v1/favorites/:id` - Remove carpark from favorites

#### User Endpoints
- `GET /api/v1/users/profile` - Get current user profile
- `PATCH /api/v1/users/profile` - Update user profile

### 5.3 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:5001/api/v1/carparks
```

---

## 🔐 7. Environment Variables Reference

### 7.1 Backend (.env)

Complete backend environment variable reference:

```env
# Server Configuration
NODE_ENV=development
PORT=5001
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parkmate_db
DB_USER=postgres
DB_PASSWORD=your_database_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
CARPARK_API_URL=https://api.data.gov.sg/v1/transport/carpark-availability
CARPARK_API_KEY=

# Email Configuration (optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@parkmate.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=debug
```

### 7.2 Frontend (.env)

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5001/api/v1

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: Environment
VITE_ENV=development
```

---

## 🚢 8. Deployment

### 8.1 Docker Production Deployment

The easiest way to deploy ParkMate is using Docker:

```bash
# Start all services
docker-compose up -d

# Import carpark data
./docker-import-carparks.sh

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

For detailed Docker deployment instructions, see [DOCKER_README.md](./DOCKER_README.md)

### 8.2 Manual Production Build

**Backend:**
```bash
cd backend
npm install --production
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve the 'dist' folder with Nginx or similar
```

### 8.3 Environment Configuration

Ensure you update environment variables for production:
- Use strong, unique JWT secrets
- Configure production database credentials
- Set appropriate CORS origins
- Enable production logging level
- Configure email service for password reset

---

## 📖 9. Additional Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed local development setup
- [DOCKER_README.md](./DOCKER_README.md) - Docker deployment guide
---

## 📝 10. License

This project is part of SC2006 Software Engineering coursework - **Team Glitch**

---
