# Multi-stage build for optimal image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY src ./src

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy built files from builder (includes compiled scripts in dist/scripts/)
COPY --from=builder /app/dist ./dist

# Copy source files for reference and runtime needs
COPY src/database ./src/database
COPY src/scripts ./src/scripts

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Use node directly for better signal handling
CMD ["node", "dist/server.js"]
