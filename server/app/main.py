from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
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
def assign_driver():
    assignment = ride_service.assign_driver()
    if assignment is None:
        raise HTTPException(status_code=404, detail="No rides or drivers available")
    return assignment

@app.post("/add_to_queue")
def add_to_queue(ride: schemas.RideRequestCreate):
    ride_data = {
        "id": len(ride_service.ride_queue) + 1,
        "pickup": (ride.pickup_lat, ride.pickup_lon),
        "destination": (ride.drop_lat, ride.drop_lon)
    }
    ride_service.ride_queue.append(ride_data)
    return {"message": "Ride added to queue", "queue_position": len(ride_service.ride_queue)}

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
    return {
        "rides_in_queue": len(ride_service.ride_queue),
        "available_drivers": len(ride_service.available_drivers)
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
    Each ride runs in its own container on a unique port (6000, 6001, 6002, ...)
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
    
    try:
        # Spawn a new container for this ride
        container_info = container_manager.spawn_ride_container(db_ride.id, ride_data)
        
        # Return the ride info with container details
        return {
            **ride_data,
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