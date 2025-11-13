from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime, timedelta
from . import crud, models, schemas
from .database import SessionLocal, engine, get_db
from .ride_service import ride_service
from .container_manager import container_manager
# from .migrations import run_migrations

models.Base.metadata.create_all(bind=engine)
# run_migrations()  # Uncomment to run migrations

app = FastAPI(title="Uber API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/request_ride", response_model=schemas.RideRequest)
def request_ride(ride: schemas.RideRequestCreate, db: Session = Depends(get_db)):
    return crud.create_ride_request(db=db, ride=ride)

@app.get("/rides/{user_id}", response_model=List[schemas.RideRequest])
def get_rides(user_id: int, db: Session = Depends(get_db)):
    return crud.get_rides_by_user(db=db, user_id=user_id)

@app.post("/register_driver", response_model=schemas.Driver)
def register_driver(driver: schemas.DriverCreate, db: Session = Depends(get_db)):
    return crud.create_driver(db=db, driver=driver)

@app.get("/drivers/available", response_model=List[schemas.Driver])
def get_available_drivers(db: Session = Depends(get_db)):
    return crud.get_available_drivers(db=db)

@app.get("/drivers", response_model=List[schemas.Driver])
def get_all_drivers(db: Session = Depends(get_db)):
    return crud.get_drivers(db=db)

@app.post("/register_drivers_bulk", response_model=List[schemas.Driver])
def register_drivers_bulk(bulk_data: schemas.BulkDriverCreate, db: Session = Depends(get_db)):
    return crud.create_bulk_drivers(db=db, drivers=bulk_data.drivers)

@app.post("/assign_driver")
def assign_driver(db: Session = Depends(get_db)):
    assignment = ride_service.assign_driver()
    if assignment is None:
        raise HTTPException(status_code=404, detail="No rides or drivers available")
    
    # Update driver status in database
    driver_id = assignment["driver"]["id"]
    crud.update_driver_status(db, driver_id, "busy")
    
    return assignment

@app.post("/add_to_queue")
def add_to_queue(ride: schemas.RideRequestCreate):
    """Add ride to queue (supports priority)"""
    priority = ride.priority.value if hasattr(ride, 'priority') else "normal"
    ride_data = {
        "id": len(ride_service.ride_queue) + 1,
        "pickup": (ride.pickup_lat, ride.pickup_lon),
        "destination": (ride.drop_lat, ride.drop_lon),
        "priority": priority
    }
    ride_service.add_ride_to_queue(ride_data, priority)
    queue_status = ride_service.get_queue_status()
    
    return {
        "message": f"Ride added to {priority} queue",
        "queue_status": queue_status
    }

@app.post("/add_driver_location")
def add_driver_location(driver_id: int, latitude: float, longitude: float):
    driver_data = {
        "id": driver_id,
        "location": (latitude, longitude)
    }
    ride_service.available_drivers.append(driver_data)
    return {"message": "Driver added to available pool"}

@app.get("/queue_status")
def get_queue_status():
    """Get detailed queue status including emergency and normal counts"""
    return ride_service.get_queue_status()

@app.get("/emergency_queue_status")
def get_emergency_queue_status():
    """Get status of emergency vs normal queues"""
    return ride_service.get_queue_status()

@app.post("/request_emergency_ride", response_model=dict)
def request_emergency_ride(ride: schemas.RideRequestCreate, db: Session = Depends(get_db)):
    """
    Request an emergency ride with 5-minute guarantee and priority handling.
    Emergency rides get:
    - Priority in queue
    - More container resources
    - 5-minute guarantee
    - 50% surcharge
    """
    # Force priority to emergency
    ride.priority = schemas.RidePriority.EMERGENCY
    
    # Create ride in database with emergency fields
    now = datetime.now()
    guaranteed_time = now + timedelta(minutes=5)
    
    db_ride = models.RideRequest(
        user_id=ride.user_id,
        pickup_location=ride.pickup_location,
        drop_location=ride.drop_location,
        pickup_lat=ride.pickup_lat,
        pickup_lon=ride.pickup_lon,
        drop_lat=ride.drop_lat,
        drop_lon=ride.drop_lon,
        priority=models.RidePriority.EMERGENCY,
        emergency_requested_at=now,
        guaranteed_by=guaranteed_time,
        emergency_surcharge=1.5  # 50% surcharge (1.5x base fare)
    )
    db.add(db_ride)
    db.commit()
    db.refresh(db_ride)
    
    # Add to emergency queue
    ride_data = {
        "id": db_ride.id,
        "pickup": (ride.pickup_lat, ride.pickup_lon),
        "destination": (ride.drop_lat, ride.drop_lon),
        "priority": "emergency"
    }
    ride_service.add_ride_to_queue(ride_data, "emergency")
    
    # Try to assign driver immediately if available
    assignment = None
    if ride_service.available_drivers:
        assignment = ride_service.assign_driver()
    
    queue_status = ride_service.get_queue_status()
    
    return {
        "success": True,
        "ride_id": db_ride.id,
        "priority": "EMERGENCY",
        "guaranteed_by": guaranteed_time.strftime("%I:%M %p"),
        "guaranteed_by_iso": guaranteed_time.isoformat(),
        "emergency_surcharge": "50%",
        "surcharge_multiplier": 1.5,
        "assignment": assignment,
        "queue_status": queue_status,
        "message": f"🚨 Emergency ride confirmed! Guaranteed pickup by {guaranteed_time.strftime('%I:%M %p')}"
    }

@app.post("/request_emergency_ride_container", response_model=dict)
def request_emergency_ride_with_container(ride: schemas.RideRequestCreate, db: Session = Depends(get_db)):
    """
    Request an emergency ride with dedicated container and priority handling.
    This spawns a high-priority container with more resources.
    """
    # Force priority to emergency
    ride.priority = schemas.RidePriority.EMERGENCY
    
    # Create ride in database with emergency fields
    now = datetime.now()
    guaranteed_time = now + timedelta(minutes=5)
    
    db_ride = models.RideRequest(
        user_id=ride.user_id,
        pickup_location=ride.pickup_location,
        drop_location=ride.drop_location,
        pickup_lat=ride.pickup_lat,
        pickup_lon=ride.pickup_lon,
        drop_lat=ride.drop_lat,
        drop_lon=ride.drop_lon,
        priority=models.RidePriority.EMERGENCY,
        emergency_requested_at=now,
        guaranteed_by=guaranteed_time,
        emergency_surcharge=1.5
    )
    db.add(db_ride)
    db.commit()
    db.refresh(db_ride)
    
    # Prepare ride data for the container
    ride_data = {
        'id': db_ride.id,
        'user_id': db_ride.user_id,
        'pickup_location': db_ride.pickup_location,
        'drop_location': db_ride.drop_location,
        'pickup_lat': db_ride.pickup_lat,
        'pickup_lon': db_ride.pickup_lon,
        'drop_lat': db_ride.drop_lat,
        'drop_lon': db_ride.drop_lon,
        'created_at': db_ride.created_at.isoformat(),
        'priority': 'emergency'
    }
    
    try:
        # Spawn emergency container with priority resources
        container_info = container_manager.spawn_ride_container(db_ride.id, ride_data, priority="emergency")
        
        return {
            'success': True,
            'ride_id': db_ride.id,
            'priority': 'EMERGENCY',
            'guaranteed_by': guaranteed_time.strftime("%I:%M %p"),
            'guaranteed_by_iso': guaranteed_time.isoformat(),
            'emergency_surcharge': '50%',
            'surcharge_multiplier': 1.5,
            'container_port': container_info['host_port'],
            'container_url': container_info['url'],
            'container_id': container_info['container_id'][:12],
            'container_resources': '1.0 CPUs, 512MB RAM',
            'message': f"🚨 Emergency ride container spawned! Guaranteed pickup by {guaranteed_time.strftime('%I:%M %p')}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to spawn emergency container: {str(e)}")

@app.get("/driver/{driver_id}", response_model=schemas.Driver)
def get_driver(driver_id: int, db: Session = Depends(get_db)):
    """Get driver information by ID"""
    driver = crud.get_driver_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@app.post("/complete_ride/{driver_id}")
def complete_ride(driver_id: int, db: Session = Depends(get_db)):
    """Mark ride as complete and make driver available again"""
    driver = crud.update_driver_status(db, driver_id, "available")
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    return {
        "message": f"Driver {driver_id} is now available",
        "driver": {
            "id": driver.id,
            "name": driver.name,
            "status": driver.status
        }
    }

@app.get("/")
def root():
    return {"message": "Uber API is running"}


# ============================================================================
# Container Management Endpoints - Dynamic Ride Container Spawning
# ============================================================================

@app.post("/request_ride_container")
def request_ride_with_container(ride: schemas.RideRequestCreate, db: Session = Depends(get_db)):
    """
    Create a ride request and spawn a dedicated Docker container for it.
    Each ride runs in its own container on a unique port (7000, 7001, 7002, ...)
    Supports both normal and emergency priorities.
    """
    # First, create the ride in the database
    db_ride = crud.create_ride_request(db=db, ride=ride)
    
    # Prepare ride data for the container
    ride_data = {
        'id': db_ride.id,
        'user_id': db_ride.user_id,
        'pickup_location': db_ride.pickup_location,
        'drop_location': db_ride.drop_location,
        'pickup_lat': db_ride.pickup_lat,
        'pickup_lon': db_ride.pickup_lon,
        'drop_lat': db_ride.drop_lat,
        'drop_lon': db_ride.drop_lon,
        'created_at': db_ride.created_at.isoformat()
    }
    
    # Get priority (default to normal if not specified)
    priority = ride.priority.value if hasattr(ride, 'priority') and ride.priority else "normal"
    
    try:
        # Spawn a new container for this ride with appropriate priority
        container_info = container_manager.spawn_ride_container(db_ride.id, ride_data, priority=priority)
        
        # Return the ride info with container details
        return {
            **ride_data,
            'priority': priority.upper(),
            'container_port': container_info['host_port'],
            'container_url': container_info['url'],
            'container_id': container_info['container_id'][:12]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to spawn container: {str(e)}")


@app.get("/ride_containers")
def get_active_ride_containers() -> Dict:
    """Get all active ride containers with their port mappings"""
    containers = container_manager.get_all_active_containers()
    
    return {
        'total_containers': len(containers),
        'containers': [
            {
                'ride_id': info['ride_id'],
                'host_port': info['host_port'],
                'url': info['url'],
                'container_id': info['container_id'][:12],
                'started_at': info['started_at'],
                'user_id': info['ride_data'].get('user_id'),
                'pickup': info['ride_data'].get('pickup_location'),
                'drop': info['ride_data'].get('drop_location')
            }
            for info in containers.values()
        ]
    }


@app.get("/ride_container/{ride_id}")
def get_ride_container_info(ride_id: int):
    """Get container information for a specific ride"""
    container_info = container_manager.get_container_info(ride_id)
    
    if not container_info:
        raise HTTPException(status_code=404, detail=f"No container found for ride {ride_id}")
    
    return {
        'ride_id': container_info['ride_id'],
        'host_port': container_info['host_port'],
        'internal_port': container_info['internal_port'],
        'url': container_info['url'],
        'container_id': container_info['container_id'][:12],
        'container_name': container_info['container_name'],
        'started_at': container_info['started_at'],
        'status': container_info['status'],
        'ride_data': container_info['ride_data']
    }


@app.get("/ride_container/{ride_id}/logs")
def get_ride_container_logs(ride_id: int, tail: int = 50):
    """Get logs from a ride container"""
    logs = container_manager.get_container_logs(ride_id, tail)
    
    if logs is None:
        raise HTTPException(status_code=404, detail=f"No container found for ride {ride_id}")
    
    return {
        'ride_id': ride_id,
        'logs': logs
    }


@app.post("/ride_container/{ride_id}/stop")
def stop_ride_container(ride_id: int):
    """Stop and remove a ride container"""
    success = container_manager.stop_ride_container(ride_id)
    
    if not success:
        raise HTTPException(status_code=404, detail=f"No container found for ride {ride_id}")
    
    return {
        'success': True,
        'message': f'Container for ride {ride_id} stopped successfully'
    }


@app.post("/cleanup_containers")
def cleanup_all_ride_containers():
    """Stop and remove all ride containers"""
    container_manager.cleanup_all_containers()
    
    return {
        'success': True,
        'message': 'All ride containers cleaned up successfully'
    }