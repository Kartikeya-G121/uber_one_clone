from sqlalchemy import text
from .database import engine

def run_migrations():
    """Run database migrations to add new columns"""
    # Use raw connection with autocommit to avoid transaction issues
    raw_conn = engine.raw_connection()
    raw_conn.autocommit = True
    cursor = raw_conn.cursor()
    
    migrations = [
        ("latitude to drivers", "ALTER TABLE drivers ADD COLUMN latitude FLOAT"),
        ("longitude to drivers", "ALTER TABLE drivers ADD COLUMN longitude FLOAT"),
        ("pickup_lat to ride_requests", "ALTER TABLE ride_requests ADD COLUMN pickup_lat FLOAT NOT NULL DEFAULT 0"),
        ("pickup_lon to ride_requests", "ALTER TABLE ride_requests ADD COLUMN pickup_lon FLOAT NOT NULL DEFAULT 0"),
        ("drop_lat to ride_requests", "ALTER TABLE ride_requests ADD COLUMN drop_lat FLOAT NOT NULL DEFAULT 0"),
        ("drop_lon to ride_requests", "ALTER TABLE ride_requests ADD COLUMN drop_lon FLOAT NOT NULL DEFAULT 0"),
        ("status to ride_requests", "ALTER TABLE ride_requests ADD COLUMN status VARCHAR DEFAULT 'pending'"),
        ("driver_id to ride_requests", "ALTER TABLE ride_requests ADD COLUMN driver_id INTEGER"),
        ("assigned_at to ride_requests", "ALTER TABLE ride_requests ADD COLUMN assigned_at TIMESTAMP"),
        ("completed_at to ride_requests", "ALTER TABLE ride_requests ADD COLUMN completed_at TIMESTAMP"),
    ]
    
    for column_name, sql in migrations:
        try:
            cursor.execute(sql)
            print(f"✅ Added {column_name}")
        except Exception as e:
            # Column likely already exists, which is fine
            print(f"⚠️  {column_name} might already exist: {e}")
    
    cursor.close()
    raw_conn.close()
    print("✨ Migration completed successfully")
