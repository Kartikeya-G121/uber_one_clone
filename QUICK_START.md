# 🚀 Quick Start Guide - Dynamic Ride Containers

## Setup (One-time)

```bash
# 1. Build the ride container image
./setup_containers.sh

# 2. Start the main server
docker compose up
```

## Usage

### Request a Ride (Spawns a Container)

**Via UI:**
1. Open http://localhost:3000/user/index.html
2. Fill in ride details
3. Click "Request Ride"
4. Container info will be displayed

**Via API:**
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

### View All Active Containers

```bash
curl http://localhost:8000/ride_containers
```

### Stop a Container

```bash
curl -X POST http://localhost:8000/ride_container/1/stop
```

### Cleanup All Containers

```bash
curl -X POST http://localhost:8000/cleanup_containers
```

## Port Assignments

- Main Server: **8000**
- Database: **5433**
- Ride #1: **7000**
- Ride #2: **7001**
- Ride #3: **7002**
- ... and so on

## Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /request_ride_container` | Create ride + spawn container |
| `GET /ride_containers` | List all containers |
| `GET /ride_container/{id}` | Get container info |
| `GET /ride_container/{id}/logs` | View logs |
| `POST /ride_container/{id}/stop` | Stop container |
| `POST /cleanup_containers` | Stop all |

## Troubleshooting

**Container not starting?**
```bash
# Check Docker is running
docker ps

# View logs
docker logs uber-ride-1
```

**Port in use?**
```bash
# Check what's using the port
lsof -i :7000
```

**Image not found?**
```bash
# Rebuild the image
./setup_containers.sh
```

## Quick Commands

```bash
# See all ride containers
docker ps | grep uber-ride

# Stop all ride containers
docker stop $(docker ps -q --filter name=uber-ride)

# Remove all ride containers
docker rm $(docker ps -aq --filter name=uber-ride)

# View container logs
docker logs uber-ride-1 --tail 50
```

## That's it! 🎉

Each ride request now runs in its own Docker container!
