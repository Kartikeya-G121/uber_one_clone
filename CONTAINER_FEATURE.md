# 🐳 Dynamic Ride Container Feature

## Overview

This feature allows each ride request to run in its own dedicated Docker container on a unique host port (7000, 7001, 7002, ...). This provides isolation, scalability, and independent management for each ride.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main FastAPI Server                       │
│                   (Port 8000)                                │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Container Manager                           │    │
│  │  - Tracks ride_id → port mappings                  │    │
│  │  - Spawns Docker containers dynamically            │    │
│  │  - Manages container lifecycle                     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Spawns containers
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Individual Ride Containers                  │
├──────────────────┬──────────────────┬──────────────────┐    │
│   Ride #1        │   Ride #2        │   Ride #3        │    │
│   Port 7000      │   Port 7001      │   Port 7002      │    │
│   (Container)    │   (Container)    │   (Container)    │    │
└──────────────────┴──────────────────┴──────────────────┘    │
```

## How It Works

### 1. Container Manager Module
Located in `server/app/container_manager.py`, this module:
- Manages port allocation (starting from 7000)
- Tracks active containers in memory
- Uses subprocess to execute Docker commands
- Provides container lifecycle management

### 2. New API Endpoints

#### Request Ride with Container
```http
POST /request_ride_container
```

**Request Body:**
```json
{
  "user_id": 1,
  "pickup_location": "Times Square",
  "drop_location": "Central Park",
  "pickup_lat": 40.7580,
  "pickup_lon": -73.9855,
  "drop_lat": 40.7829,
  "drop_lon": -73.9654
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "pickup_location": "Times Square",
  "drop_location": "Central Park",
  "container_port": 7000,
  "container_url": "http://localhost:7000",
  "container_id": "abc123def456",
  "created_at": "2025-10-10T12:00:00"
}
```

#### View All Active Containers
```http
GET /ride_containers
```

**Response:**
```json
{
  "total_containers": 3,
  "containers": [
    {
      "ride_id": 1,
      "host_port": 7000,
      "url": "http://localhost:7000",
      "container_id": "abc123def456",
      "started_at": "2025-10-10T12:00:00",
      "user_id": 1,
      "pickup": "Times Square",
      "drop": "Central Park"
    }
  ]
}
```

#### Get Container Info for Specific Ride
```http
GET /ride_container/{ride_id}
```

#### Get Container Logs
```http
GET /ride_container/{ride_id}/logs?tail=50
```

#### Stop a Container
```http
POST /ride_container/{ride_id}/stop
```

#### Cleanup All Containers
```http
POST /cleanup_containers
```

## Setup Instructions

### 1. Build the Docker Image

First, build the image that will be used for ride containers:

```bash
cd /home/dipstick/Repos/Uber-Clone/uber_one_clone
docker build -t uber_one_clone-server:latest -f server/Dockerfile.ride server/
```

### 2. Start the Main Server

Make sure your main server is running:

```bash
docker compose up
```

The main server will be available at `http://localhost:8000`

### 3. Request a Ride with Container

You can use the updated UI at `http://localhost:3000/user/index.html` or use the API directly:

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

### 4. View Active Containers

```bash
curl http://localhost:8000/ride_containers
```

## Port Mapping

- **Main Server**: Port 8000
- **PostgreSQL**: Port 5433 (external) → 5432 (internal)
- **Ride Containers**: 
  - First ride: Port 7000
  - Second ride: Port 7001
  - Third ride: Port 7002
  - And so on...

Each ride container runs the same FastAPI app internally on port 7000, but is mapped to a unique host port.

## Client UI Updates

### Rider Interface (`client/user/`)

The rider interface now:
1. Uses `/request_ride_container` endpoint instead of `/request_ride`
2. Displays container information including:
   - Container port
   - Container URL (clickable link)
   - Container ID
3. Has a new section to view all active ride containers

**Features:**
- Click "Request Ride" to spawn a new container
- Click "View All Containers" to see all active ride containers
- Each container is accessible via its unique URL

## Container Lifecycle

### 1. Container Creation
When a ride is requested:
1. Ride is saved to the database
2. Container manager allocates a new port
3. Docker container is spawned with ride data as environment variables
4. Container information is tracked in memory
5. User receives container URL and port

### 2. Container Operations
- **View Logs**: Get real-time logs from any container
- **Monitor Status**: Check container health and status
- **Access Individually**: Each container has its own API endpoint

### 3. Container Cleanup
Stop containers individually or all at once:

```bash
# Stop specific ride container
curl -X POST http://localhost:8000/ride_container/1/stop

# Cleanup all containers
curl -X POST http://localhost:8000/cleanup_containers
```

## Use Cases

### 1. Isolated Ride Management
Each ride runs in its own environment, preventing interference between rides.

### 2. Scalability
Easily scale to handle multiple rides without resource contention.

### 3. Independent Monitoring
View logs and status for each ride independently.

### 4. Testing
Test different ride scenarios in isolated containers.

### 5. Microservices Architecture
Each ride becomes its own microservice with dedicated resources.

## Technical Details

### Container Manager Implementation

```python
class RideContainerManager:
    def __init__(self, start_port: int = 7000):
        self.start_port = start_port
        self.current_port = start_port
        self.active_containers: Dict[int, Dict] = {}
        
    def spawn_ride_container(self, ride_id: int, ride_data: Dict):
        # Allocate port
        # Build Docker command
        # Execute with subprocess
        # Track container
        # Return container info
```

### Docker Command Structure

```bash
docker run -d \
  --name uber-ride-{ride_id} \
  -p {host_port}:7000 \
  -e RIDE_ID={ride_id} \
  -e RIDE_DATA={json_data} \
  -e DATABASE_URL={db_url} \
  --network bridge \
  uber_one_clone-server:latest
```

## Troubleshooting

### Issue: Container fails to start
**Solution**: Check Docker logs
```bash
docker logs uber-ride-{ride_id}
```

### Issue: Port already in use
**Solution**: The container manager automatically allocates the next available port. If you restart the main server, the port counter resets.

### Issue: Cannot connect to container
**Solution**: Make sure the container is running
```bash
docker ps | grep uber-ride
```

### Issue: Database connection fails
**Solution**: Ensure the main PostgreSQL container is running and accessible at `host.docker.internal:5433`

## Benefits

✅ **Isolation**: Each ride runs independently  
✅ **Scalability**: Easily handle multiple concurrent rides  
✅ **Monitoring**: Individual container logs and metrics  
✅ **Debugging**: Isolate issues to specific rides  
✅ **Flexibility**: Different configurations per ride  
✅ **Resource Management**: Better control over resource allocation  

## Limitations

⚠️ **Memory**: Each container uses additional memory  
⚠️ **Port Exhaustion**: Limited number of ports available  
⚠️ **Cleanup**: Containers must be manually cleaned up  
⚠️ **State**: Container state is lost when stopped (unless persisted)  

## Future Enhancements

- Auto-cleanup of completed rides
- Resource limits per container
- Container orchestration with Kubernetes
- Load balancing across containers
- Persistent container state
- Container health monitoring
- Automatic scaling based on demand

## Example Workflow

1. **User requests ride** → Container spawned on port 7000
2. **Driver accepts** → Driver connects to `http://localhost:7000`
3. **Ride starts** → Updates tracked in dedicated container
4. **Ride completes** → Container logs final state
5. **Container stopped** → Resources freed, port available for reuse

## Conclusion

This feature transforms each ride into an independent microservice, providing better isolation, scalability, and management capabilities. It's particularly useful for:
- High-traffic scenarios
- Testing and development
- Debugging specific rides
- Implementing ride-specific features

