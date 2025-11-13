from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class RidePriority(str, Enum):
    NORMAL = "normal"
    EMERGENCY = "emergency"

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
    priority: RidePriority = RidePriority.NORMAL

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
    priority: RidePriority
    emergency_requested_at: Optional[datetime] = None
    guaranteed_by: Optional[datetime] = None
    emergency_surcharge: float = 0.0
    
    class Config:
        from_attributes = True

class BulkDriverCreate(BaseModel):
    drivers: List[DriverCreate]