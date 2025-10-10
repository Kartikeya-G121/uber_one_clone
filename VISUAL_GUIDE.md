# 🚗 Multiple Rides on Different Ports - Visual Guide

```
┌─────────────────────────────────────────────────────────────────┐
│                     TERMINAL WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   TERMINAL 1     │  cd /home/dipstick/Repos/Uber-Clone/uber_one_clone
│   Main Server    │  docker compose up
└──────────────────┘
         │
         │ Listening on port 8000
         ▼
   ✅ Server Ready!


┌──────────────────┐
│   TERMINAL 2     │  curl -X POST http://localhost:8000/request_ride_container
│   Ride #1        │  -H "Content-Type: application/json"
└──────────────────┘  -d '{"user_id": 1, ...}'
         │
         │ Spawns container
         ▼
   🐳 Container on PORT 7000
   📍 Times Square → Central Park
   🌐 http://localhost:7000


┌──────────────────┐
│   TERMINAL 3     │  curl -X POST http://localhost:8000/request_ride_container
│   Ride #2        │  -H "Content-Type: application/json"
└──────────────────┘  -d '{"user_id": 2, ...}'
         │
         │ Spawns container
         ▼
   🐳 Container on PORT 7001
   📍 Brooklyn Bridge → Statue of Liberty
   🌐 http://localhost:7001


┌──────────────────┐
│   TERMINAL 4     │  curl -X POST http://localhost:8000/request_ride_container
│   Ride #3        │  -H "Content-Type: application/json"
└──────────────────┘  -d '{"user_id": 3, ...}'
         │
         │ Spawns container
         ▼
   🐳 Container on PORT 7002
   📍 Empire State → MSG
   🌐 http://localhost:7002


┌──────────────────┐
│   TERMINAL 5     │  curl http://localhost:8000/ride_containers
│   View All       │
└──────────────────┘
         │
         ▼
   {
     "total_containers": 3,
     "containers": [
       {"ride_id": 1, "host_port": 7000, ...},
       {"ride_id": 2, "host_port": 7001, ...},
       {"ride_id": 3, "host_port": 7002, ...}
     ]
   }
```

---

## 🎯 SIMPLE 2-STEP METHOD

### Step 1: Main Server (Terminal 1)
```bash
docker compose up
```

### Step 2: All Rides (Terminal 2)
```bash
./spawn_test_rides.sh
```

**BOOM! 3 rides running on ports 7000, 7001, 7002** 🚀

---

## 📊 PORT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR SYSTEM                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🖥️  Main Server              →  Port 8000                  │
│  🗄️  PostgreSQL Database      →  Port 5433                  │
│  🌐  Web UI                    →  Port 3000                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           DYNAMIC RIDE CONTAINERS                   │    │
│  ├────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  🚗 Ride #1 Container      →  Port 7000            │    │
│  │     ├─ Internal Port: 7000                         │    │
│  │     ├─ User: 1                                     │    │
│  │     └─ Route: Times Square → Central Park         │    │
│  │                                                     │    │
│  │  🚕 Ride #2 Container      →  Port 7001            │    │
│  │     ├─ Internal Port: 7000                         │    │
│  │     ├─ User: 2                                     │    │
│  │     └─ Route: Brooklyn → Statue of Liberty        │    │
│  │                                                     │    │
│  │  🚙 Ride #3 Container      →  Port 7002            │    │
│  │     ├─ Internal Port: 7000                         │    │
│  │     ├─ User: 3                                     │    │
│  │     └─ Route: Empire State → MSG                  │    │
│  │                                                     │    │
│  │  ... more rides on 7003, 6004, 6005 ...           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 WORKFLOW DIAGRAM

```
1️⃣  START MAIN SERVER
    ↓
    docker compose up
    ↓
    ✅ Server on :8000


2️⃣  REQUEST RIDE #1
    ↓
    POST /request_ride_container
    ↓
    🐳 Spawn Container
    ↓
    📌 Port 7000 Allocated
    ↓
    ✅ Ride #1 Running on :7000


3️⃣  REQUEST RIDE #2
    ↓
    POST /request_ride_container
    ↓
    🐳 Spawn Container
    ↓
    📌 Port 7001 Allocated
    ↓
    ✅ Ride #2 Running on :7001


4️⃣  REQUEST RIDE #3
    ↓
    POST /request_ride_container
    ↓
    🐳 Spawn Container
    ↓
    📌 Port 7002 Allocated
    ↓
    ✅ Ride #3 Running on :7002


5️⃣  ACCESS & MONITOR
    ↓
    - http://localhost:7000 → Ride #1
    - http://localhost:7001 → Ride #2
    - http://localhost:7002 → Ride #3
    - GET /ride_containers → View All
```

---

## 🎬 QUICK DEMO

```bash
# Terminal 1
docker compose up

# Terminal 2 (wait 5 seconds, then run)
./spawn_test_rides.sh

# You'll see:
# ✅ Ride 1: Port 7000 - http://localhost:7000
# ✅ Ride 2: Port 7001 - http://localhost:7001
# ✅ Ride 3: Port 7002 - http://localhost:7002

# Terminal 3 - Verify
curl http://localhost:8000/ride_containers

# Terminal 4 - Check Docker
docker ps | grep uber-ride

# Output:
# uber-ride-1  ...  0.0.0.0:7000->7000/tcp
# uber-ride-2  ...  0.0.0.0:7001->7000/tcp
# uber-ride-3  ...  0.0.0.0:7002->7000/tcp
```

---

## 🧪 TEST EACH RIDE

```bash
# Test Ride #1
curl http://localhost:7000/

# Test Ride #2
curl http://localhost:7001/

# Test Ride #3
curl http://localhost:7002/
```

---

## 📱 ACCESS FROM BROWSER

Open these URLs in different tabs:
- **Tab 1:** http://localhost:7000 ← Ride #1
- **Tab 2:** http://localhost:7001 ← Ride #2
- **Tab 3:** http://localhost:7002 ← Ride #3

Or use the UI:
- **Tab 4:** http://localhost:3000/user/index.html
  - Click "View All Containers"
  - See all rides with their ports

---

## 🧹 CLEANUP

```bash
# Stop all ride containers
curl -X POST http://localhost:8000/cleanup_containers

# Verify they're gone
docker ps | grep uber-ride
# (Should show nothing)
```

---

## ✅ CHECKLIST

- [x] Built ride container image (`./setup_containers.sh`)
- [x] Main server running (`docker compose up`)
- [x] Spawned 3 rides (`./spawn_test_rides.sh`)
- [x] Can access http://localhost:7000
- [x] Can access http://localhost:7001
- [x] Can access http://localhost:7002
- [x] Verified with `/ride_containers` endpoint

**ALL DONE! 🎉**

---

## 💡 TIPS

### Pretty Print JSON (Optional)
If you want formatted JSON output, install `jq`:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# Then use:
curl http://localhost:8000/ride_containers | jq
```

Or use Python:
```bash
curl http://localhost:8000/ride_containers | python3 -m json.tool
```
