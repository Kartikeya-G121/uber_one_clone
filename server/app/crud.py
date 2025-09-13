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