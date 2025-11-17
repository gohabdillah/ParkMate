import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000'),
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'parkmate_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  externalApis: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    carparkApiUrl: process.env.CARPARK_API_URL || 'https://api.data.gov.sg/v1/transport/carpark-availability',
    carparkApiKey: process.env.CARPARK_API_KEY || '',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@parkmate.com',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute window
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute (generous for development)
  },

  cors: {
    origin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000', 'http://localhost:3001'],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
};

export default config;
