#!/bin/bash
# Quick test script to spawn 3 rides simultaneously

echo "🚗 Spawning 3 Ride Containers Simultaneously..."
echo "================================================"
echo ""

# Ride 1
echo "📍 Requesting Ride #1 (Times Square → Central Park)..."
RESPONSE1=$(curl -s -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "pickup_location": "Times Square", "drop_location": "Central Park", "pickup_lat": 40.7580, "pickup_lon": -73.9855, "drop_lat": 40.7829, "drop_lon": -73.9654}')
PORT1=$(echo $RESPONSE1 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('container_port', 'N/A'))" 2>/dev/null || echo "N/A")
URL1=$(echo $RESPONSE1 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('container_url', 'N/A'))" 2>/dev/null || echo "N/A")
echo "✅ Ride 1: Port $PORT1 - $URL1"

echo ""

# Ride 2
echo "📍 Requesting Ride #2 (Brooklyn Bridge → Statue of Liberty)..."
RESPONSE2=$(curl -s -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2, "pickup_location": "Brooklyn Bridge", "drop_location": "Statue of Liberty", "pickup_lat": 40.7061, "pickup_lon": -73.9969, "drop_lat": 40.6892, "drop_lon": -74.0445}')
PORT2=$(echo $RESPONSE2 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('container_port', 'N/A'))" 2>/dev/null || echo "N/A")
URL2=$(echo $RESPONSE2 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('container_url', 'N/A'))" 2>/dev/null || echo "N/A")
echo "✅ Ride 2: Port $PORT2 - $URL2"

echo ""

# Ride 3
echo "📍 Requesting Ride #3 (Empire State → MSG)..."
RESPONSE3=$(curl -s -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{"user_id": 3, "pickup_location": "Empire State Building", "drop_location": "Madison Square Garden", "pickup_lat": 40.7484, "pickup_lon": -73.9857, "drop_lat": 40.7505, "drop_lon": -73.9934}')
PORT3=$(echo $RESPONSE3 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('container_port', 'N/A'))" 2>/dev/null || echo "N/A")
URL3=$(echo $RESPONSE3 | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('container_url', 'N/A'))" 2>/dev/null || echo "N/A")
echo "✅ Ride 3: Port $PORT3 - $URL3"

echo ""
echo "================================================"
echo "✅ All 3 rides spawned!"
echo ""
echo "🔍 Verify with: curl http://localhost:8000/ride_containers"
echo "🐳 Check Docker: docker ps | grep uber-ride"
echo ""
echo "Access rides:"
echo "  - Ride #1: $URL1"
echo "  - Ride #2: $URL2"
echo "  - Ride #3: $URL3"
echo ""
