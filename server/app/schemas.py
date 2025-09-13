from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class DriverCreate(BaseModel):
    name: str
    car_no: str
    status: str = "available"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class Driver(BaseModel):
    id: int
    name: str
    car_no: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    class Config:
        from_attributes = True

class RideRequestCreate(BaseModel):
    user_id: int
    pickup_location: str
    drop_location: str
    pickup_lat: float
    pickup_lon: float
    drop_lat: float
    drop_lon: float

class RideRequest(BaseModel):
    id: int
    user_id: int
    pickup_location: str
    drop_location: str
    pickup_lat: float
    pickup_lon: float
    drop_lat: float
    drop_lon: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class BulkDriverCreate(BaseModel):
    drivers: List[DriverCreate]