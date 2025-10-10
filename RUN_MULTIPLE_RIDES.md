# 🚗 Running Multiple Rides Simultaneously - Step by Step

## Quick Setup (First Time Only)

### Terminal 1: Build the Ride Container Image
```bash
./setup_containers.sh
```

**OR manually:**
```bash
cd /server
docker build -t uber_one_clone-server:latest -f Dockerfile.ride .
cd ..
```

---

## Running Multiple Rides Simultaneously

### Terminal 1: Start Main Server & Database
```bash
docker compose up
```

**Wait for:** "Uvicorn running on http://0.0.0.0:8000"

---

### Terminal 2: Request First Ride (Will spawn on port 7000)
```bash
curl -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "pickup_location": "Times Square",
    "drop_location": "Central Park",
    "pickup_lat": 40.7580,
    "pickup_lon": -73.9855,
    "drop_lat": 40.7829,
    "drop_lon": -73.9654
  }'
```

**Expected Output:**
```
🔌 Container Port: 7000
🌐 Access URL: http://localhost:7000
📦 Container ID: abc123...
```

---

### Terminal 3: Request Second Ride (Will spawn on port 7001)
```bash
curl -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "pickup_location": "Brooklyn Bridge",
    "drop_location": "Statue of Liberty",
    "pickup_lat": 40.7061,
    "pickup_lon": -73.9969,
    "drop_lat": 40.6892,
    "drop_lon": -74.0445
  }'
```

**Expected Output:**
```
🔌 Container Port: 7001
🌐 Access URL: http://localhost:7001
📦 Container ID: def456...
```

---

### Terminal 4: Request Third Ride (Will spawn on port 7002)
```bash
curl -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 3,
    "pickup_location": "Empire State Building",
    "drop_location": "Madison Square Garden",
    "pickup_lat": 40.7484,
    "pickup_lon": -73.9857,
    "drop_lat": 40.7505,
    "drop_lon": -73.9934
  }'
```

**Expected Output:**
```
🔌 Container Port: 7002
🌐 Access URL: http://localhost:7002
📦 Container ID: ghi789...
```

---

### Terminal 5: View All Active Containers
```bash
curl http://localhost:8000/ride_containers
```

**Expected Output:**
```json
{
  "total_containers": 3,
  "containers": [
    {
      "ride_id": 1,
      "host_port": 7000,
      "url": "http://localhost:7000",
      "user_id": 1,
      "pickup": "Times Square",
      "drop": "Central Park"
    },
    {
      "ride_id": 2,
      "host_port": 7001,
      "url": "http://localhost:7001",
      "user_id": 2,
      "pickup": "Brooklyn Bridge",
      "drop": "Statue of Liberty"
    },
    {
      "ride_id": 3,
      "host_port": 7002,
      "url": "http://localhost:7002",
      "user_id": 3,
      "pickup": "Empire State Building",
      "drop": "Madison Square Garden"
    }
  ]
}
```

---

## 🌐 Access Individual Rides

Each ride has its own URL:

### Terminal 6: Access Ride #1
```bash
# Health check
curl http://localhost:7000/

# Get ride info (if ride service endpoints are available)
curl http://localhost:7000/rides/1
```

### Terminal 7: Access Ride #2
```bash
curl http://localhost:7001/
```

### Terminal 8: Access Ride #3
```bash
curl http://localhost:7002/
```

---

## 🔍 Monitor Containers

### Check Running Docker Containers
```bash
docker ps | grep uber-ride
```

**Expected Output:**
```
abc123...  uber_one_clone-server  Up  0.0.0.0:7000->7000/tcp  uber-ride-1
def456...  uber_one_clone-server  Up  0.0.0.0:7001->7000/tcp  uber-ride-2
ghi789...  uber_one_clone-server  Up  0.0.0.0:7002->7000/tcp  uber-ride-3
```

### View Container Logs
```bash
# Ride #1 logs
curl http://localhost:8000/ride_container/1/logs

# OR directly with Docker
docker logs uber-ride-1 --tail 50

# Ride #2 logs
docker logs uber-ride-2 --tail 50

# Ride #3 logs
docker logs uber-ride-3 --tail 50
```

---

## 🎨 Using the Web UI (Easier!)

### Option 1: Open Multiple Browser Tabs

**Tab 1:** http://localhost:3000/user/index.html
- Request Ride #1
- You'll see: Container Port: 7000

**Tab 2:** http://localhost:3000/user/index.html
- Request Ride #2
- You'll see: Container Port: 7001

**Tab 3:** http://localhost:3000/user/index.html
- Request Ride #3
- You'll see: Container Port: 7002

### Option 2: View All Containers in UI
**Tab 4:** http://localhost:3000/user/index.html
- Scroll down to "🐳 Active Ride Containers"
- Click "View All Containers"
- See all 3 rides with their ports

---

## 🛑 Stop Individual Rides

### Terminal: Stop Ride #1
```bash
curl -X POST http://localhost:8000/ride_container/1/stop
```

### Terminal: Stop Ride #2
```bash
curl -X POST http://localhost:8000/ride_container/2/stop
```

### Terminal: Stop All Rides at Once
```bash
curl -X POST http://localhost:8000/cleanup_containers
```

---

## 📋 Complete Example: 3 Rides in Parallel

### Setup (One Terminal)
```bash
# Terminal 1 - Start everything
cd /home/dipstick/Repos/Uber-Clone/uber_one_clone
docker compose up
```

### Create Rides (One Command, Multiple Rides)
```bash
# In a new terminal, run all three at once:
curl -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "pickup_location": "Times Square", "drop_location": "Central Park", "pickup_lat": 40.7580, "pickup_lon": -73.9855, "drop_lat": 40.7829, "drop_lon": -73.9654}' &

curl -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2, "pickup_location": "Brooklyn Bridge", "drop_location": "Statue of Liberty", "pickup_lat": 40.7061, "pickup_lon": -73.9969, "drop_lat": 40.6892, "drop_lon": -74.0445}' &

curl -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{"user_id": 3, "pickup_location": "Empire State", "drop_location": "MSG", "pickup_lat": 40.7484, "pickup_lon": -73.9857, "drop_lat": 40.7505, "drop_lon": -73.9934}' &

wait
```

### Verify All Running
```bash
curl http://localhost:8000/ride_containers
```

---

## 🔥 Pro Tips

### 1. Quick Check What's Running
```bash
# See all ride containers with ports
docker ps --filter name=uber-ride --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"
```

### 2. Follow Logs in Real-Time
```bash
# Terminal for Ride #1
docker logs -f uber-ride-1

# Terminal for Ride #2
docker logs -f uber-ride-2

# Terminal for Ride #3
docker logs -f uber-ride-3
```

### 3. Test Each Container
```bash
# Ride #1
curl http://localhost:7000/ && echo "✅ Ride 1 OK"

# Ride #2
curl http://localhost:7001/ && echo "✅ Ride 2 OK"

# Ride #3
curl http://localhost:7002/ && echo "✅ Ride 3 OK"
```

### 4. Cleanup Everything
```bash
# Stop all ride containers
docker stop $(docker ps -q --filter name=uber-ride)

# Remove all ride containers
docker rm $(docker ps -aq --filter name=uber-ride)

# Or use the API
curl -X POST http://localhost:8000/cleanup_containers
```

---

## 📊 Summary of Ports

| Service | Port | URL |
|---------|------|-----|
| Main Server | 8000 | http://localhost:8000 |
| Database | 5433 | postgresql://localhost:5433 |
| Web UI | 3000 | http://localhost:3000 |
| Ride #1 | 7000 | http://localhost:7000 |
| Ride #2 | 7001 | http://localhost:7001 |
| Ride #3 | 7002 | http://localhost:7002 |
| Ride #N | 7000+N-1 | http://localhost:7000+N-1 |

---

## 🎯 Expected Workflow

1. **Start main server** (Terminal 1): `docker compose up`
2. **Request rides** (Terminals 2-4): Use curl or UI
3. **Monitor** (Terminal 5): `docker ps | grep uber-ride`
4. **Access rides** (Browser tabs): http://localhost:7000, 7001, 7002
5. **View logs** (Terminals 6-8): `docker logs uber-ride-X`
6. **Cleanup** when done: `curl -X POST http://localhost:8000/cleanup_containers`

---

## ✅ Verification Checklist

- [ ] Main server running on port 8000
- [ ] Database running on port 5433
- [ ] Ride #1 container running on port 7000
- [ ] Ride #2 container running on port 7001
- [ ] Ride #3 container running on port 7002
- [ ] Can access http://localhost:7000
- [ ] Can access http://localhost:7001
- [ ] Can access http://localhost:7002
- [ ] All rides visible in `/ride_containers` endpoint
- [ ] UI shows all active containers

**That's it! You now have multiple rides running simultaneously on different ports!** 🚀
