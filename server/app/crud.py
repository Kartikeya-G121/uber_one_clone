from sqlalchemy.orm import Session
from . import models, schemas

def create_driver(db: Session, driver: schemas.DriverCreate):
    db_driver = models.Driver(**driver.dict())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver

def get_drivers(db: Session):
    return db.query(models.Driver).all()

def get_available_drivers(db: Session):
    return db.query(models.Driver).filter(models.Driver.status == "available").all()

def get_driver_by_id(db: Session, driver_id: int):
    return db.query(models.Driver).filter(models.Driver.id == driver_id).first()

def update_driver_status(db: Session, driver_id: int, status: str):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if driver:
        driver.status = status
        db.commit()
        db.refresh(driver)
    return driver

def update_driver_location(db: Session, driver_id: int, latitude: float, longitude: float):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if driver:
        driver.latitude = latitude
        driver.longitude = longitude
        db.commit()
        db.refresh(driver)
    return driver

def create_ride_request(db: Session, ride: schemas.RideRequestCreate):
    db_ride = models.RideRequest(**ride.dict())
    db.add(db_ride)
    db.commit()
    db.refresh(db_ride)
    return db_ride

def get_rides_by_user(db: Session, user_id: int):
    return db.query(models.RideRequest).filter(models.RideRequest.user_id == user_id).all()

def create_bulk_drivers(db: Session, drivers: list[schemas.DriverCreate]):
    db_drivers = [models.Driver(**driver.dict()) for driver in drivers]
    db.add_all(db_drivers)
    db.commit()
    for driver in db_drivers:
        db.refresh(driver)
    return db_drivers

def assign_ride_to_driver(db: Session, ride_id: int, driver_id: int):
    from datetime import datetime
    ride = db.query(models.RideRequest).filter(models.RideRequest.id == ride_id).first()
    if ride:
        ride.driver_id = driver_id
        ride.status = "in_progress"
        ride.assigned_at = datetime.now()
        db.commit()
        db.refresh(ride)
    return ride

def complete_ride(db: Session, ride_id: int):
    from datetime import datetime
    ride = db.query(models.RideRequest).filter(models.RideRequest.id == ride_id).first()
    if ride:
        ride.status = "completed"
        ride.completed_at = datetime.now()
        db.commit()
        db.refresh(ride)
    return ride

def get_active_rides_by_driver(db: Session, driver_id: int):
    return db.query(models.RideRequest).filter(
        models.RideRequest.driver_id == driver_id,
        models.RideRequest.status.in_(["pending", "in_progress"])
    ).all()

def get_active_rides_by_user(db: Session, user_id: int):
    return db.query(models.RideRequest).filter(
        models.RideRequest.user_id == user_id,
        models.RideRequest.status.in_(["pending", "in_progress"])
    ).all()