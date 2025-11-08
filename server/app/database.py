from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:informat.7@db:5432/uber_db")

# Optimized engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,          # 20 connections in pool
    max_overflow=30,       # 30 additional connections
    pool_pre_ping=True,    # Validate connections
    pool_recycle=3600      # Recycle connections every hour
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()