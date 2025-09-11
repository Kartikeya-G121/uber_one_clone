from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    car_no = Column(String, nullable=False)
    status = Column(String, default="available")

class RideRequest(Base):
    __tablename__ = "ride_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    pickup_location = Column(String, nullable=False)
    drop_location = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())