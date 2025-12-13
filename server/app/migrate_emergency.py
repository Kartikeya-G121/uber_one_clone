"""
Migration script to add emergency ride fields to the database
Run this after updating the models to add the new columns
"""

from sqlalchemy import text
from .database import engine

def upgrade_emergency_fields():
    """Add emergency ride fields to ride_requests table"""
    
    with engine.connect() as conn:
        try:
            # Drop the enum type if it exists to recreate it
            conn.execute(text("""
                DROP TYPE IF EXISTS ridepriority CASCADE;
            """))
            conn.commit()
            
            # Create the enum type with uppercase values to match Python enum
            conn.execute(text("""
                CREATE TYPE ridepriority AS ENUM ('NORMAL', 'EMERGENCY');
            """))
            conn.commit()
            
            # Add priority column
            conn.execute(text("""
                ALTER TABLE ride_requests 
                ADD COLUMN IF NOT EXISTS priority ridepriority DEFAULT 'NORMAL'::ridepriority NOT NULL;
            """))
            conn.commit()
            
            # Add emergency_requested_at column
            conn.execute(text("""
                ALTER TABLE ride_requests 
                ADD COLUMN IF NOT EXISTS emergency_requested_at TIMESTAMP;
            """))
            conn.commit()
            
            # Add guaranteed_by column
            conn.execute(text("""
                ALTER TABLE ride_requests 
                ADD COLUMN IF NOT EXISTS guaranteed_by TIMESTAMP;
            """))
            conn.commit()
            
            # Add emergency_surcharge column
            conn.execute(text("""
                ALTER TABLE ride_requests 
                ADD COLUMN IF NOT EXISTS emergency_surcharge FLOAT DEFAULT 0.0;
            """))
            conn.commit()
            
            print("✅ Successfully added emergency ride fields to database")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            conn.rollback()
            raise

def downgrade_emergency_fields():
    """Remove emergency ride fields from ride_requests table"""
    
    with engine.connect() as conn:
        try:
            # Remove columns
            conn.execute(text("""
                ALTER TABLE ride_requests 
                DROP COLUMN IF EXISTS emergency_surcharge;
            """))
            conn.commit()
            
            conn.execute(text("""
                ALTER TABLE ride_requests 
                DROP COLUMN IF EXISTS guaranteed_by;
            """))
            conn.commit()
            
            conn.execute(text("""
                ALTER TABLE ride_requests 
                DROP COLUMN IF EXISTS emergency_requested_at;
            """))
            conn.commit()
            
            conn.execute(text("""
                ALTER TABLE ride_requests 
                DROP COLUMN IF EXISTS priority;
            """))
            conn.commit()
            
            # Drop enum type
            conn.execute(text("""
                DROP TYPE IF EXISTS ridepriority;
            """))
            conn.commit()
            
            print("✅ Successfully removed emergency ride fields from database")
            
        except Exception as e:
            print(f"❌ Error during downgrade: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    print("Running emergency ride migration...")
    upgrade_emergency_fields()
