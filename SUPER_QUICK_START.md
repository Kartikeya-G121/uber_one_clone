# 🚀 SUPER QUICK START - 3 Rides on Different Ports

## ONE-TIME SETUP (Do this first!)

```bash
cd /home/dipstick/Repos/Uber-Clone/uber_one_clone
./setup_containers.sh
```

---

## RUN MULTIPLE RIDES - 3 SIMPLE STEPS

### STEP 1: Start Main Server (Terminal 1)
```bash
cd /home/dipstick/Repos/Uber-Clone/uber_one_clone
docker compose up
```
**Wait for:** "Uvicorn running on http://0.0.0.0:8000" ✅

---

### STEP 2: Spawn 3 Rides (Terminal 2)
```bash
cd /home/dipstick/Repos/Uber-Clone/uber_one_clone
./spawn_test_rides.sh
```

**You'll see:**
```
✅ Ride 1: Port 7000 - http://localhost:7000
✅ Ride 2: Port 7001 - http://localhost:7001
✅ Ride 3: Port 7002 - http://localhost:7002
```

---

### STEP 3: Verify (Terminal 3)
```bash
curl http://localhost:8000/ride_containers
```

**OR check Docker:**
```bash
docker ps | grep uber-ride
```

---

## ACCESS YOUR RIDES

**Browser:**
- Ride #1: http://localhost:7000
- Ride #2: http://localhost:7001
- Ride #3: http://localhost:7002

**UI:**
- http://localhost:3000/user/index.html
- Click "View All Containers"

---

## MANUAL METHOD (If you prefer curl)

### Terminal 2: Ride #1
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

### Terminal 3: Ride #2
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

### Terminal 4: Ride #3
```bash
curl -X POST http://localhost:8000/request_ride_container \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 3,
    "pickup_location": "Empire State",
    "drop_location": "MSG",
    "pickup_lat": 40.7484,
    "pickup_lon": -73.9857,
    "drop_lat": 40.7505,
    "drop_lon": -73.9934
  }'
```

---

## CLEANUP

```bash
# Stop all ride containers
curl -X POST http://localhost:8000/cleanup_containers

# OR manually
docker stop $(docker ps -q --filter name=uber-ride)
docker rm $(docker ps -aq --filter name=uber-ride)
```

---

## THAT'S IT! 🎉

**Summary:**
1. `docker compose up` ← Start main server
2. `./spawn_test_rides.sh` ← Spawn 3 rides
3. Visit http://localhost:7000, 7001, 7002 ← Access rides

**Each ride runs in its own container on a different port!** 🚗🚕🚙
