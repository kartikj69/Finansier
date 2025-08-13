# Docker Setup for Finansier

This document explains how to run the Finansier application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository and navigate to the project directory:**
   ```bash
   git clone <repository-url>
   cd Finansier
   ```

2. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend & Backend: http://localhost:9000
   - MongoDB: localhost:27017

## Docker Architecture

The application uses a multi-stage Docker build with the following components:

### 1. Client Builder Stage
- Builds the React frontend using Vite
- Creates optimized production build

### 2. Server Builder Stage
- Prepares the Node.js backend
- Installs production dependencies

### 3. Production Runtime Stage
- Combines built client and server
- Runs the application with security best practices
- Serves React app directly from Node.js server

## Services

### MongoDB Service
- **Image:** `mongo:6.0`
- **Port:** 27017
- **Database:** finansier
- **Credentials:** admin/password123
- **Persistent Storage:** Yes (mongodb_data volume)

### Application Service
- **Port:** 9000
- **Environment:** Production
- **Health Check:** Enabled
- **Dependencies:** MongoDB
- **Features:** Serves both API and React frontend

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGO_URL=mongodb://admin:password123@mongodb:27017/finansier?authSource=admin

# Application Configuration
NODE_ENV=production
PORT=9000

# Optional: Custom MongoDB credentials
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=finansier
```

## Docker Commands

### Build the application
```bash
docker-compose build
```

### Start all services
```bash
docker-compose up -d
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes
```bash
docker-compose down -v
```

### Rebuild and restart
```bash
docker-compose up --build -d
```

## Development vs Production

### Development
For development, you can run individual services:

```bash
# Start only MongoDB
docker-compose up mongodb

# Run client locally
cd client && npm run dev

# Run server locally
cd server && npm run dev
```

### Production
For production deployment:

```bash
# Build and start all services
docker-compose -f docker-compose.yml up --build -d

# Scale the application if needed
docker-compose up -d --scale app=3
```

## Security Features

- **Non-root user:** Application runs as non-root user (nodejs)
- **Signal handling:** Proper signal handling with dumb-init
- **Health checks:** Built-in health monitoring
- **Security headers:** Express.js provides security headers via Helmet

## Monitoring and Logs

### Health Checks
- Application: `/kpi` endpoint
- Docker: Built-in health checks for all services

### Logs Location
- Application logs: `./logs/` directory
- MongoDB logs: Container logs

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :9000
   netstat -tulpn | grep :27017
   ```

2. **MongoDB connection issues:**
   ```bash
   # Check MongoDB container status
   docker-compose ps mongodb
   
   # Check MongoDB logs
   docker-compose logs mongodb
   ```

3. **Build failures:**
   ```bash
   # Clean build cache
   docker-compose build --no-cache
   
   # Remove all containers and images
   docker-compose down --rmi all
   ```

### Performance Optimization

1. **Enable Docker BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Use multi-platform builds:**
   ```bash
   docker buildx build --platform linux/amd64,linux/arm64 .
   ```

## Backup and Restore

### MongoDB Backup
```bash
# Create backup
docker exec finansier-mongodb mongodump --out /backup

# Copy backup from container
docker cp finansier-mongodb:/backup ./backup
```

### MongoDB Restore
```bash
# Copy backup to container
docker cp ./backup finansier-mongodb:/backup

# Restore database
docker exec finansier-mongodb mongorestore /backup
```

## Scaling

### Horizontal Scaling
```bash
# Scale the application service
docker-compose up -d --scale app=3
```

### Resource Limits
Add resource limits in `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Recent Changes

### Dependency Resolution
- Removed `mongoose-currency` dependency that was incompatible with Mongoose 7.x
- Implemented custom currency type handling directly in models
- Updated Dockerfile to remove legacy peer deps flags

### Simplified Architecture
- Removed complex nginx reverse proxy setup
- React app now served directly from Node.js server
- Single port (9000) serves both API and frontend

## Contributing

When contributing to the Docker setup:

1. Test changes locally
2. Update documentation
3. Ensure security best practices
4. Test with different environments

## Support

For Docker-related issues:
1. Check the troubleshooting section
2. Review Docker and Docker Compose logs
3. Ensure all prerequisites are met
4. Check for port conflicts
