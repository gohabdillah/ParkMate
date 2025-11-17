import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import config from './config/environment';
import { pool } from './config/database';
import RedisClient from './config/redis';
import authRoutes from './modules/auth/auth.routes';
import carparkRoutes from './modules/carpark/carpark.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import { errorHandler, notFound } from './shared/middleware/errorHandler';
import { apiLimiter } from './shared/middleware/rateLimiter';
import logger from './shared/utils/logger';

const app: Application = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ParkMate API',
      version: '1.0.0',
      description: 'API documentation for ParkMate parking application',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, './modules/**/*.routes.ts'), path.join(__dirname, './modules/**/*.routes.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
// Disable CSP for development to allow Swagger UI to work
if (config.env === 'development') {
  app.use(helmet({ contentSecurityPolicy: false }));
} else {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );
}

app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply rate limiter only in production (disabled in development for easier testing)
if (config.env === 'production') {
  app.use(apiLimiter);
  logger.info('🛡️  Rate limiter enabled');
} else {
  logger.info('⚠️  Rate limiter disabled (development mode)');
}

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ParkMate API Documentation',
  customfavIcon: 'https://swagger.io/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/carparks`, carparkRoutes);
app.use(`/api/${config.apiVersion}/favorites`, favoritesRoutes);
// Add more routes here as modules are created
// app.use(`/api/${config.apiVersion}/history`, historyRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('✅ Database connected successfully');

    // Connect to Redis
    const redisClient = RedisClient.getInstance();
    await redisClient.connect();
    logger.info('✅ Redis connected successfully');

    app.listen(config.port, () => {
      logger.info(`🚀 Server is running on port ${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
      logger.info(`🌍 Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
