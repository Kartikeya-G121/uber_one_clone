from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas
from .database import SessionLocal, engine, get_db
from .ride_service import ride_service
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