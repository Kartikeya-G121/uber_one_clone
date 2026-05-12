# Uber Quick - Dynamic Ride Containers with Emergency Priority

**Uber Quick** is a FastAPI-based ride-sharing platform that reimagines scalability by isolating each ride within its own Docker container. The system features a central server that manages the lifecycle of ride containers, automatically allocating ports starting from 7000 for each new ride. Every ride instance runs independently, providing clean isolation, easier debugging, and seamless scalability. Core functionalities include containerized ride management, driver-rider matching via the Haversine formula for location accuracy, and priority-based ride assignment with an innovative Emergency feature. The backend integrates with PostgreSQL for storing drivers and ride request data, while the React web UI offers dedicated views for riders, drivers, and admins. Designed for efficiency and experimentation, the project simplifies container orchestration with scripts for setup, spawning test rides, and cleanup. With its modular architecture, per-ride logging, and automated container lifecycle management, Uber Quick demonstrates a highly scalable, microservice-inspired approach to real-time ride management.

---


## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Emergency Feature](#emergency-feature-uber-quick-priority)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Container Management](#container-management)
- [Web Interface](#web-interface)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (for React UI development)

### Installation


```bash
# 1. Clone the repository
git clone https://github.com/Kartikeya-G121/uber_one_clone.git
cd uber_one_clone

# 2. Build Docker image for ride containers (one-time setup)
./setup_containers.sh

# 3. Start all services
docker compose up --build

# 4. Access the application
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs

# 5. Spawn test rides (optional)
./spawn_test_rides.sh
```

**Result:** 3 test rides running on ports 7000, 7001, 7002
- http://localhost:7000/docs
- http://localhost:7001/docs
- http://localhost:7002/docs

---

## Features

### Core Features

#### 1. Dynamic Container Architecture
- **Container Per Ride**: Each ride request spawns an isolated Docker container
- **Auto Port Allocation**: Automatically assigns ports starting from 7000
- **Resource Management**: Configurable CPU and memory limits per container
- **Lifecycle Management**: Automatic container cleanup on ride completion

#### 2. Intelligent Driver Matching
- **Haversine Formula**: Calculates accurate distances using GPS coordinates
- **Smart Assignment**: Matches nearest available driver to ride requests
- **Real-time Location**: Drivers can update their location dynamically
- **Auto-availability**: Drivers automatically become available after ride completion with updated location at drop-off point

#### 3. Queue Management System
- **Dual Queue Architecture**: Separate queues for emergency and normal rides
- **Priority Processing**: Emergency rides processed before normal rides
- **FIFO for Normal Rides**: Fair first-in-first-out processing for standard requests
- **Min-Heap for Emergency**: Timestamp-based priority for urgent requests
- **Queue Visualization**: Real-time view of waiting rides in admin panel

#### 4. Complete Ride Lifecycle
- **States**: pending → in_progress → completed
- **Status Tracking**: Real-time updates across all interfaces
- **Active Rides Dashboard**: View current rides for both riders and drivers
- **End Ride Functionality**: Complete rides with automatic driver reset

#### 5. Multi-Interface Web UI
- **React-based Frontend**: Modern, responsive single-page application
- **Rider Interface**: Request rides, view history, track active rides
- **Driver Interface**: Register, update location, accept rides, complete jobs
- **Admin Panel**: Monitor queue, view all rides/drivers, manage containers

---

## Emergency Feature (Uber Quick Priority)

The flagship **Emergency** feature provides guaranteed service within 5 minutes for urgent ride requests.

### How It Works

1. **Priority Queue**: Emergency rides bypass the normal queue using a min-heap sorted by timestamp
2. **5-Minute Guarantee**: System calculates and displays guaranteed pickup time (Request Time + 5 minutes)
3. **Premium Pricing**: Automatic 50% surcharge (1.5x base fare) applied to emergency rides
4. **Enhanced Resources**: Emergency containers receive higher resource allocation:
   - **CPU**: 1.0 cores (vs 0.5 for normal)
   - **Memory**: 512MB (vs 256MB for normal)
5. **Visual Distinction**: Emergency rides highlighted with red borders, yellow background, and emergency badge throughout the UI

### Using Emergency Mode

**Via Web UI:**
1. Go to Rider page: http://localhost:3000/rider
2. Fill in ride details
3. Check the "Emergency Ride (5-min guarantee, +50% fare)" checkbox
4. Click "Request Ride"
5. See guaranteed pickup time and surcharge confirmation

**Via API:**
```bash
curl -X POST http://localhost:8000/request_emergency_ride \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 101,
    "pickup_location": "Hospital Emergency",
    "drop_location": "Airport",
    "pickup_lat": 40.7128,
    "pickup_lon": -74.0060,
    "drop_lat": 40.7589,
    "drop_lon": -73.9851,
    "priority": "EMERGENCY"
  }'
```

**Response:**
```json
{
  "ride": {
    "id": 45,
    "user_id": 101,
    "priority": "EMERGENCY",
    "guaranteed_by": "2025-12-09T15:35:00",
    "emergency_requested_at": "2025-12-09T15:30:00"
  },
  "message": "Emergency ride requested! Guaranteed pickup by 03:35 PM"
}
```

### Emergency Benefits

- **Immediate Processing**: First in queue regardless of wait time
- **Dedicated Resources**: Higher-spec containers ensure reliable performance
- **Transparent Pricing**: Clear surcharge disclosure before confirmation
- **SLA Tracking**: System monitors and logs guarantee compliance
- **Visual Priority**: Red highlighting in all interfaces for quick identification

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Uber Quick Platform                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │  React UI    │◄────►│   FastAPI       │                 │
│  │  (Port 3000) │      │   Main Server   │                 │
│  │              │      │   (Port 8000)   │                 │
│  └──────────────┘      └────────┬────────┘                 │
│                                  │                           │
│                         ┌────────▼─────────┐                │
│                         │ Container Manager│                │
│                         │  + Ride Service  │                │
│                         └────────┬─────────┘                │
│                                  │                           │
│                    ┌─────────────┼─────────────┐            │
│                    ▼             ▼             ▼            │
│            ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│            │ Ride #1  │  │ Ride #2  │  │ Ride #N  │        │
│            │ Port 7000│  │ Port 7001│  │ Port 700N│        │
│            └──────────┘  └──────────┘  └──────────┘        │
│                                                               │
│  ┌────────────┐         ┌────────────┐                      │
│  │ PostgreSQL │◄───────►│   Redis    │                      │
│  │ (Port 5433)│         │ (Port 6379)│                      │
│  └────────────┘         └────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- FastAPI (Python 3.11) - High-performance async API framework
- SQLAlchemy - ORM for database operations
- psycopg2 - PostgreSQL driver
- Docker SDK - Container management
- Uvicorn - ASGI server

**Frontend:**
- React 18 - Component-based UI library
- React Router - Client-side routing
- Lucide React - Icon library
- Axios - HTTP client

**Infrastructure:**
- Docker & Docker Compose - Containerization
- PostgreSQL 15 - Relational database
- Redis - Caching and session management
- Nginx - Frontend reverse proxy

---

## API Endpoints

### Ride Management

#### Container-based Rides

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/request_ride_container` | Create ride + spawn dedicated container |
| POST | `/request_emergency_ride_container` | Create emergency ride + spawn priority container |
| GET | `/ride_containers` | List all active ride containers |
| GET | `/ride_container/{ride_id}` | Get specific container info |
| GET | `/ride_container/{ride_id}/logs` | View container logs |
| POST | `/ride_container/{ride_id}/stop` | Stop specific container |
| POST | `/cleanup_containers` | Stop all ride containers |

#### Traditional Rides

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/request_ride` | Create standard ride request |
| POST | `/request_emergency_ride` | Create emergency ride request |
| POST | `/end_ride/{ride_id}` | Complete a ride |
| GET | `/rides/{user_id}` | Get all rides for user |
| GET | `/active_rides/user/{user_id}` | Get active rides for user |
| GET | `/active_rides/driver/{driver_id}` | Get driver's active rides |

### Driver Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register_driver` | Register single driver |
| POST | `/register_drivers_bulk` | Bulk register drivers |
| GET | `/drivers` | Get all drivers |
| GET | `/drivers/available` | Get available drivers |
| POST | `/add_driver_location` | Update driver GPS coordinates |

### Queue & Assignment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add_to_queue` | Add ride to queue |
| POST | `/assign_driver` | Assign nearest driver to ride |
| GET | `/queue_status` | Get queue statistics |
| GET | `/emergency_queue_status` | Get emergency vs normal counts |
| GET | `/queue_details` | Get detailed queue with ride info |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/docs` | Interactive API documentation (Swagger) |
| GET | `/redoc` | Alternative API documentation |

### API Examples

**Request Emergency Ride:**
```bash
curl -X POST http://localhost:8000/request_emergency_ride \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "pickup_location": "Times Square, NYC",
    "drop_location": "Central Park, NYC",
    "pickup_lat": 40.7580,
    "pickup_lon": -73.9855,
    "drop_lat": 40.7829,
    "drop_lon": -73.9654,
    "priority": "EMERGENCY"
  }'
```

**Assign Driver:**
```bash
curl -X POST http://localhost:8000/assign_driver
```

**Get Queue Details:**
```bash
curl http://localhost:8000/queue_details
```

**End Ride:**
```bash
curl -X POST http://localhost:8000/end_ride/45
```

---

## Database Schema

### Tables

#### drivers
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String | Driver name |
| car_no | String | Vehicle registration |
| status | String | available, busy, offline |
| latitude | Float | Current GPS latitude |
| longitude | Float | Current GPS longitude |

#### ride_requests
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Rider identifier |
| pickup_location | String | Pickup address |
| drop_location | String | Destination address |
| pickup_lat | Float | Pickup GPS latitude |
| pickup_lon | Float | Pickup GPS longitude |
| drop_lat | Float | Drop GPS latitude |
| drop_lon | Float | Drop GPS longitude |
| created_at | DateTime | Request creation time |
| priority | String | NORMAL, EMERGENCY |
| status | String | pending, in_progress, completed |
| driver_id | Integer | Assigned driver (FK) |
| assigned_at | DateTime | Assignment timestamp |
| completed_at | DateTime | Completion timestamp |
| emergency_requested_at | DateTime | Emergency request time |
| guaranteed_by | DateTime | Emergency guarantee deadline |
| emergency_surcharge | Float | Additional emergency charge |

---

## Container Management

### How Containers Work

1. **Spawning**: When a ride is requested via `/request_ride_container`:
   - Port is allocated (7000, 7001, 7002, ...)
   - Container name: `uber-ride-{ride_id}`
   - Environment variables set (RIDE_ID, USER_ID, coordinates, priority)
   - Container started with resource limits based on priority

2. **Monitoring**: 
   - View all: `GET /ride_containers`
   - Check specific: `GET /ride_container/{ride_id}`
   - Logs: `GET /ride_container/{ride_id}/logs`

3. **Cleanup**:
   - Auto: Containers can be programmatically stopped
   - Manual: `POST /cleanup_containers` or `docker stop`

### Container Commands

```bash
# List all ride containers
docker ps --filter name=uber-ride

# View container logs
docker logs uber-ride-1

# Stop specific container
docker stop uber-ride-1

# Remove stopped containers
docker rm $(docker ps -a -q --filter name=uber-ride)

# View resource usage
docker stats --filter name=uber-ride
```

---

## Web Interface

### Access Points

- **Home**: http://localhost:3000 - Role selection with Emergency feature highlight
- **Rider**: http://localhost:3000/rider - Request rides, view active rides
- **Driver**: http://localhost:3000/driver - Register, accept rides, update location
- **Admin**: http://localhost:3000/admin - Monitor system, manage queue

### Rider Interface Features

- **Request Ride Form**: Input pickup/drop locations and coordinates
- **Emergency Toggle**: Checkbox to enable Emergency mode with surcharge warning
- **Ride History**: View all past rides by User ID
- **Active Rides**: Real-time display of ongoing rides with End Ride button
- **Available Drivers**: See nearby drivers ready to accept rides

### Driver Interface Features

- **Registration**: Sign up with name, car number, initial status
- **Location Updates**: Update current GPS coordinates
- **Accept Next Ride**: Get assigned to highest priority ride from queue
- **Active Rides**: View assigned ride with Complete Ride button
- **Queue Status**: See emergency/normal ride counts and available drivers

### Admin Interface Features

- **Ride Queue Visualization**: Live view of waiting rides (emergency in red, normal in gray)
- **Container Management**: Monitor active ride containers
- **Driver Overview**: See all registered drivers with status
- **System Stats**: Queue counts, available drivers, active containers

---

## Testing

### Manual Testing Workflow

**1. Test Emergency Feature:**
```bash
# Terminal 1: Start services
docker compose up

# Terminal 2: Create emergency ride
curl -X POST http://localhost:8000/request_emergency_ride \
  -H "Content-Type: application/json" \
  -d '{"user_id": 101, "pickup_location": "Hospital", "drop_location": "Airport", "pickup_lat": 40.7128, "pickup_lon": -74.0060, "drop_lat": 40.7589, "drop_lon": -73.9851, "priority": "EMERGENCY"}'

# Check queue (emergency should be first)
curl http://localhost:8000/queue_details

# Register driver
curl -X POST http://localhost:8000/register_driver \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "car_no": "ABC123", "status": "available", "latitude": 40.7128, "longitude": -74.0060}'

# Assign driver (emergency ride gets priority)
curl -X POST http://localhost:8000/assign_driver

# End ride
curl -X POST http://localhost:8000/end_ride/1
```

**2. Test Container Spawning:**
```bash
# Spawn 3 test rides
./spawn_test_rides.sh

# Verify containers
docker ps | grep uber-ride

# Access container
curl http://localhost:7000/docs

# Cleanup
curl -X POST http://localhost:8000/cleanup_containers
```

**3. Test via UI:**
1. Open http://localhost:3000
2. Go to Rider page
3. Fill ride details, check Emergency
4. Click Request Ride
5. Go to Admin page to see red emergency badge in queue
6. Go to Driver page to accept ride
7. See status change to "In Progress"
8. Click "Complete Ride" to finish

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Container won't start | Missing image | Run `./setup_containers.sh` |
| Port already in use | Previous container running | `docker stop $(docker ps -q --filter name=uber-ride)` |
| Database connection error | Wrong password | Check docker-compose.yml DATABASE_URL |
| Frontend not loading | React build failed | `docker compose up react-ui --build` |
| Browser blocks port | Firefox blocks 6000-6063 | Use ports 7000+ (already configured) |
| Queue shows N/A | Frontend cache | Hard refresh: Ctrl+Shift+R |
| Ride status stuck | Database not updated | Check server logs: `docker compose logs server` |
| Driver not available | Status not reset | Verify end_ride endpoint called |

### Debug Commands

```bash
# View server logs
docker compose logs -f server

# View React logs
docker compose logs -f react-ui

# Check database
docker exec -it uber_one_clone-db-1 psql -U postgres -d uber_db

# Inside psql:
SELECT * FROM ride_requests ORDER BY id DESC LIMIT 5;
SELECT * FROM drivers WHERE status = 'available';

# Container inspection
docker inspect uber-ride-1

# Network check
docker network ls
docker network inspect uber_one_clone_default
```

---

## Project Structure

```
uber_one_clone/
├── server/
│   ├── app/
│   │   ├── main.py                 # FastAPI application
│   │   ├── container_manager.py    # Docker container orchestration
│   │   ├── ride_service.py         # Priority queue & assignment logic
│   │   ├── models.py               # SQLAlchemy database models
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   ├── crud.py                 # Database CRUD operations
│   │   ├── database.py             # DB connection configuration
│   │   └── migrations.py           # Database migration utilities
│   ├── Dockerfile                  # Main server Docker image
│   ├── Dockerfile.ride             # Ride container image
│   └── requirements.txt            # Python dependencies
├── react-ui/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Landing page with Emergency highlight
│   │   │   ├── RiderPage.js        # Rider interface
│   │   │   ├── DriverPage.js       # Driver interface
│   │   │   └── AdminPage.js        # Admin dashboard
│   │   ├── services/
│   │   │   └── api.js              # API client
│   │   ├── components/
│   │   │   └── common/
│   │   │       └── Header.js       # Navigation header
│   │   ├── App.js                  # React router setup
│   │   └── index.js                # Entry point
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── Dockerfile                  # React build Dockerfile
│   ├── nginx.conf                  # Nginx configuration
│   └── package.json                # Node dependencies
├── docker-compose.yml               # Service orchestration
├── setup_containers.sh              # Container setup script
├── spawn_test_rides.sh              # Test ride generator
├── EMERGENCY_FEATURE.md             # Emergency feature docs
├── FEATURES_SUMMARY.md              # Feature overview
└── README.md                        # This file
```

---

## Development

### Running Locally (Without Docker)

```bash
# Backend
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL (Docker)
docker run -d --name uber_postgres \
  -e POSTGRES_PASSWORD=SHER \
  -e POSTGRES_DB=uber_db \
  -p 5433:5432 \
  postgres:15-alpine

# Run server
uvicorn app.main:app --reload --port 8000

# Frontend
cd react-ui
npm install
npm start  # Runs on port 3000
```

### Making Changes

1. **Backend changes**: Edit files in `server/app`, then `docker compose up --build server`
2. **Frontend changes**: Edit files in `react-ui/src`, then `docker compose up --build react-ui`
3. **Database schema**: Update `models.py`, create migration, rebuild server

---

## Performance

- **Concurrent Rides**: Tested with 10+ simultaneous ride containers
- **Response Time**: < 100ms for API calls
- **Container Startup**: ~2-3 seconds per ride container
- **Memory**: ~150MB per ride container (normal), ~200MB (emergency)
- **Database**: Indexed on ride status, driver status, and timestamps

---

## Future Enhancements

- Real-time WebSocket updates for live ride tracking
- Driver rating and feedback system
- Payment integration
- Route optimization with multi-stop support
- Ride sharing (multiple passengers)
- Push notifications for ride updates
- Mobile app (React Native)
- Analytics dashboard with metrics

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

MIT License - See LICENSE file for details

---

## Credits

**Project**: Uber Quick - Dynamic Ride Containers  
**Repository**: https://github.com/Kartikeya-G121/uber_one_clone  
**Branch**: pricing-feature
**Built with**: FastAPI, React, Docker, PostgreSQL

---

**Made for learning Docker orchestration, microservices architecture, and real-time systems**

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
