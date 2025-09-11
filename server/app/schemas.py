from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DriverCreate(BaseModel):
    name: str
    car_no: str
    status: str = "available"

class Driver(BaseModel):
    id: int
    name: str
    car_no: str
    status: str
    
    class Config:
        from_attributes = True

class RideRequestCreate(BaseModel):
    user_id: int
    pickup_location: str
    drop_location: str

class RideRequest(BaseModel):
    id: int
    user_id: int
    pickup_location: str
    drop_location: str
    created_at: datetime
    
    class Config:
        from_attributes = True