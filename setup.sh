#!/bin/bash

echo "🛡️  Kavach - Women's Safety Application Setup"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null
then
    echo "⚠️  MongoDB not found. Installing via Homebrew..."
    if command -v brew &> /dev/null
    then
        brew tap mongodb/brew
        brew install mongodb-community
    else
        echo "❌ Homebrew not found. Please install MongoDB manually."
        exit 1
    fi
fi

echo "✅ MongoDB found"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i '' "s/your_super_secret_jwt_key_change_this_in_production/$JWT_SECRET/" .env
    echo "✅ .env file created with secure JWT secret"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create uploads directory
mkdir -p uploads

# Build the frontend
echo ""
echo "🔨 Building frontend..."
npm run build

echo ""
echo "=============================================="
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Start MongoDB: brew services start mongodb-community"
echo "  2. Run the app: npm start"
echo "  3. Open browser: http://localhost:5000"
echo ""
echo "For development mode with auto-reload:"
echo "  npm run dev"
echo ""
echo "Stay Safe! 🛡️"
