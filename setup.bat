@echo off
echo 🚀 Setting up Finansier Docker Environment
echo ==========================================

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found!
    echo Please create a .env file with your MongoDB connection string:
    echo.
    echo MONGO_URL=mongodb+srv://username:password@cluster0.mongodb.net/Financier?retryWrites=true&w=majority
    echo NODE_ENV=production
    echo PORT=9000
    echo.
    echo Replace username:password with your actual MongoDB credentials
    pause
    exit /b 1
)

echo ✅ .env file found

REM Clean up any existing containers
echo 🧹 Cleaning up existing containers...
docker-compose down -v --remove-orphans

REM Remove any existing images
echo 🗑️  Removing existing images...
docker-compose down --rmi all

REM Build the application
echo 🔨 Building application...
docker-compose build --no-cache

REM Start the application
echo 🚀 Starting application...
docker-compose up -d

REM Wait a moment for the app to start
echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check container status
echo 📊 Container status:
docker-compose ps

REM Check logs
echo 📝 Application logs:
docker-compose logs app

echo.
echo 🎉 Setup complete!
echo Access your application at: http://localhost:9000
echo.
echo If you see any errors, check the logs with: docker-compose logs -f app
pause
