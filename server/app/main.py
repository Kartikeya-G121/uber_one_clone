from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

models.Base.metadata.create_all(bind=engine)

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

@app.get("/")
def root():
    return {"message": "Uber API is running"}