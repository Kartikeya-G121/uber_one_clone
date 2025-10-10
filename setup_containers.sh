#!/bin/bash
# Setup script for the Dynamic Ride Container Feature

echo "🐳 Setting up Dynamic Ride Container Feature"
echo "============================================"

# Build the ride container image
echo "📦 Building ride container image..."
cd server
docker build -t uber_one_clone-server:latest -f Dockerfile.ride .

if [ $? -eq 0 ]; then
    echo "✅ Image built successfully!"
else
    echo "❌ Failed to build image"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Start the main server: docker compose up"
echo "  2. Open the UI: http://localhost:3000"
echo "  3. Request a ride to spawn a container"
echo "  4. View active containers in the UI"
echo ""
echo "📚 For more information, see CONTAINER_FEATURE.md"
