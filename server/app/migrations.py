from sqlalchemy import text
from .database import engine

def run_migrations():
    """Run database migrations to add new columns"""
    with engine.connect() as conn:
        # Add latitude and longitude columns to drivers table
        try:
            conn.execute(text("ALTER TABLE drivers ADD COLUMN latitude FLOAT"))
            print("Added latitude column to drivers table")
        except Exception as e:
            print(f"latitude column might already exist: {e}")
        
        try:
            conn.execute(text("ALTER TABLE drivers ADD COLUMN longitude FLOAT"))
            print("Added longitude column to drivers table")
        except Exception as e:
            print(f"longitude column might already exist: {e}")
        
        # Add coordinate columns to ride_requests table
        try:
            conn.execute(text("ALTER TABLE ride_requests ADD COLUMN pickup_lat FLOAT NOT NULL DEFAULT 0"))
            print("Added pickup_lat column to ride_requests table")
        except Exception as e:
            print(f"pickup_lat column might already exist: {e}")
        
        try:
            conn.execute(text("ALTER TABLE ride_requests ADD COLUMN pickup_lon FLOAT NOT NULL DEFAULT 0"))
            print("Added pickup_lon column to ride_requests table")
        except Exception as e:
            print(f"pickup_lon column might already exist: {e}")
        
        try:
            conn.execute(text("ALTER TABLE ride_requests ADD COLUMN drop_lat FLOAT NOT NULL DEFAULT 0"))
            print("Added drop_lat column to ride_requests table")
        except Exception as e:
            print(f"drop_lat column might already exist: {e}")
        
        try:
            conn.execute(text("ALTER TABLE ride_requests ADD COLUMN drop_lon FLOAT NOT NULL DEFAULT 0"))
            print("Added drop_lon column to ride_requests table")
        except Exception as e:
            print(f"drop_lon column might already exist: {e}")
        
        conn.commit()
        print("Migration completed successfully")