# Uber Clone - Dynamic Ride Containers

Uber-like app with FastAPI backend where **each ride runs in its own Docker container** on a separate port.

## 🚀 Quick Start

```bash
# 1. Setup (one-time)
./setup_containers.sh

# 2. Start server
docker compose up

# 3. Spawn test rides
./spawn_test_rides.sh
```

**Result:** 3 rides on ports 7000, 7001, 7002
- http://localhost:7000/docs
- http://localhost:7001/docs
- http://localhost:7002/docs

## ✨ Features

- **🐳 Container Per Ride** - Each ride in isolated Docker container
- **🔢 Auto Port Allocation** - Starts at 7000, increments automatically
- **📍 Location Matching** - Haversine formula for nearest driver
- **🎯 Queue Management** - FIFO ride assignment
- **🖥️ Web UI** - Rider, Driver, and Admin interfaces

## 📡 Key API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /request_ride_container` | Create ride + spawn container |
| `GET /ride_containers` | List all active containers |
| `POST /ride_container/{id}/stop` | Stop container |
| `POST /cleanup_containers` | Stop all containers |
| `POST /request_ride` | Traditional ride request |
| `POST /assign_driver` | Assign nearest driver |

**Full API:** http://localhost:8000/docs

## 🏗️ Architecture

```
Main Server (8000) → Container Manager → Ride Containers
                                         ├─ Ride #1 (7000)
                                         ├─ Ride #2 (7001)
                                         └─ Ride #N (7000+N)
```

## � Request a Ride

**UI:** http://localhost:3000/user/index.html

**API:**
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

## 🔍 Monitor Containers

```bash
# View all containers
curl http://localhost:8000/ride_containers

# Check Docker
docker ps | grep uber-ride

# View logs
docker logs uber-ride-1
```

## 🧹 Cleanup

```bash
# Stop all ride containers
curl -X POST http://localhost:8000/cleanup_containers

# Or manually
docker stop $(docker ps -q --filter name=uber-ride)
```

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Container won't start | `docker logs uber-ride-{id}` |
| Port in use | `./cleanup_containers` then retry |
| Image not found | Run `./setup_containers.sh` |
| Browser blocks port | Use ports 7000+ (avoid 6000-6063) |

## 📁 Project Structure

```
uber_one_clone/
├── server/app/
│   ├── container_manager.py  # Container orchestration
│   ├── main.py              # FastAPI app
│   └── ...
├── client/                   # Web UI
├── docker-compose.yml
├── setup_containers.sh       # Setup script
└── spawn_test_rides.sh       # Test script
```

## 🗄️ Database

**PostgreSQL** (port 5433):
- `drivers` - Driver info with GPS
- `ride_requests` - Ride details with coordinates

## 🎯 What Makes This Special?

✅ Each ride = isolated container  
✅ Auto port allocation  
✅ Individual logs per ride  
✅ Easy cleanup  
✅ Scalable architecture  

---

**Made with ❤️ for learning Docker & FastAPI**
