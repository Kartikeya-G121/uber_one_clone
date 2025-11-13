from sqlalchemy import Column, Integer, String, DateTime, Float, Enum as SQLEnum
from sqlalchemy.sql import func
from .database import Base
import enum

class RidePriority(enum.Enum):
    NORMAL = "normal"
    EMERGENCY = "emergency"

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    car_no = Column(String, nullable=False)
    status = Column(String, default="available")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

class RideRequest(Base):
    __tablename__ = "ride_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    pickup_location = Column(String, nullable=False)
    drop_location = Column(String, nullable=False)
    pickup_lat = Column(Float, nullable=False)
    pickup_lon = Column(Float, nullable=False)
    drop_lat = Column(Float, nullable=False)
    drop_lon = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    priority = Column(SQLEnum(RidePriority), default=RidePriority.NORMAL, nullable=False)
    emergency_requested_at = Column(DateTime, nullable=True)
    guaranteed_by = Column(DateTime, nullable=True)
    emergency_surcharge = Column(Float, default=0.0)