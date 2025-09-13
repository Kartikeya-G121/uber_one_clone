import math
from typing import List, Dict, Optional, Tuple

class RideService:
    def __init__(self):
        self.ride_queue: List[Dict] = []
        self.available_drivers: List[Dict] = []
    
    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371  # Earth radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def assign_driver(self) -> Optional[Dict]:
        """Assign nearest driver to oldest ride request"""
        if not self.ride_queue or not self.available_drivers:
            return None
        
        request = self.ride_queue.pop(0)
        pickup_lat, pickup_lon = request["pickup"]
        
        # Find nearest driver
        nearest_driver = None
        min_distance = float('inf')
        
        for driver in self.available_drivers:
            driver_lat, driver_lon = driver["location"]
            distance = self.haversine_distance(pickup_lat, pickup_lon, driver_lat, driver_lon)
            
            if distance < min_distance:
                min_distance = distance
                nearest_driver = driver
        
        # Remove assigned driver from available list
        self.available_drivers.remove(nearest_driver)
        
        # Calculate ETA (30 km/h average speed)
        eta_minutes = (min_distance / 30) * 60
        
        return {
            "driver": nearest_driver,
            "request": request,
            "distance_km": round(min_distance, 2),
            "eta_minutes": round(eta_minutes, 1)
        }

# Global instance
ride_service = RideService()