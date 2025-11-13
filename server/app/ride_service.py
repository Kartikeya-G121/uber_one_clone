import math
import heapq
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from collections import deque

class RideService:
    def __init__(self):
        self.emergency_queue: List[Tuple] = []  # Priority heap (timestamp, ride_data)
        self.normal_queue: deque = deque()  # FIFO queue for normal rides
        self.available_drivers: List[Dict] = []
    
    def add_ride_to_queue(self, ride_data: Dict, priority: str = "normal"):
        """Add ride to appropriate queue based on priority"""
        if priority == "emergency":
            # Add to priority heap (min heap by timestamp)
            heapq.heappush(self.emergency_queue, (datetime.now(), ride_data))
        else:
            # Add to normal FIFO queue
            self.normal_queue.append(ride_data)
    
    def get_next_ride(self) -> Optional[Dict]:
        """Get next ride from queue, prioritizing emergency rides"""
        if self.emergency_queue:
            _, ride_data = heapq.heappop(self.emergency_queue)
            return ride_data
        elif self.normal_queue:
            return self.normal_queue.popleft()
        return None
    
    def get_queue_status(self) -> Dict:
        """Get current queue statistics"""
        return {
            "emergency_count": len(self.emergency_queue),
            "normal_count": len(self.normal_queue),
            "total_rides": len(self.emergency_queue) + len(self.normal_queue),
            "available_drivers": len(self.available_drivers)
        }
    
    @property
    def ride_queue(self):
        """Backward compatibility - returns combined queue"""
        combined = []
        # Emergency rides first
        for _, ride in sorted(self.emergency_queue):
            combined.append(ride)
        # Then normal rides
        combined.extend(list(self.normal_queue))
        return combined
    
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
        """Assign nearest driver to next ride request (prioritizing emergency rides)"""
        if not self.available_drivers:
            return None
        
        # Get next ride from priority queue
        request = self.get_next_ride()
        if not request:
            return None
        
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