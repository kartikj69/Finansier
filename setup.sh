#!/bin/bash

echo "🚀 Setting up Finansier Docker Environment"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your MongoDB connection string:"
    echo ""
    echo "MONGO_URL=mongodb+srv://username:password@cluster0.mongodb.net/Financier?retryWrites=true&w=majority"
    echo "NODE_ENV=production"
    echo "PORT=9000"
    echo ""
    echo "Replace username:password with your actual MongoDB credentials"
    exit 1
fi

echo "✅ .env file found"

# Load environment variables
export $(cat .env | xargs)

# Check if MONGO_URL is set
if [ -z "$MONGO_URL" ]; then
    echo "❌ MONGO_URL not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "MongoDB URL: $MONGO_URL"

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v --remove-orphans

# Remove any existing images
echo "🗑️  Removing existing images..."
docker-compose down --rmi all

# Build the application
echo "🔨 Building application..."
docker-compose build --no-cache

# Start the application
echo "🚀 Starting application..."
docker-compose up -d

# Wait a moment for the app to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose ps

# Check logs
echo "📝 Application logs:"
docker-compose logs app

echo ""
echo "🎉 Setup complete!"
echo "Access your application at: http://localhost:9000"
echo ""
echo "If you see any errors, check the logs with: docker-compose logs -f app"
