# Multi-stage Dockerfile for Finansier Full-Stack Application
# Stage 1: Build the React client
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source code
COPY client/ ./

# Build the client
RUN npm run build

# Stage 2: Build the Node.js server
FROM node:18-alpine AS server-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm ci

# Copy server source code
COPY server/ ./

# Stage 3: Production runtime
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built client from client-builder stage
COPY --from=client-builder --chown=nodejs:nodejs /app/client/dist ./client/dist

# Copy server from server-builder stage
COPY --from=server-builder --chown=nodejs:nodejs /app/server ./server

# Copy package.json for server dependencies
COPY --from=server-builder --chown=nodejs:nodejs /app/server/package*.json ./server/

# Install only production dependencies for server
RUN cd server && npm ci --only=production

# Create necessary directories and set permissions
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose server port
EXPOSE 9000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server/index.js"]
