"""
Uber-style pricing calculator

Based on research of Uber's pricing model (2024), this module calculates
ride fares using the following components:

1. Base Fare - Flat fee to start the trip
2. Distance Rate - Cost per mile/km traveled
3. Time Rate - Cost per minute in the ride
4. Booking Fee - Service fee for operational costs
5. Surge Pricing - Dynamic multiplier based on demand
6. Emergency Surcharge - Additional 50% for emergency rides
7. Minimum Fare - Ensures profitability on short trips

Formula: 
Total = max(
    (Base Fare + Distance Cost + Time Cost + Booking Fee) * Surge Multiplier * Emergency Multiplier,
    Minimum Fare
)
"""

from math import radians, cos, sin, asin, sqrt
from datetime import datetime, time as dt_time
from typing import Dict, Tuple


class PricingCalculator:
    """Calculate ride fares using Uber's pricing model"""
    
    # Base pricing configuration (can vary by city)
    BASE_FARE = 2.50  # Flat fee to start ride
    COST_PER_MILE = 1.25  # Cost per mile
    COST_PER_MINUTE = 0.25  # Cost per minute
    BOOKING_FEE = 2.00  # Service fee
    MINIMUM_FARE = 6.00  # Minimum charge for any ride
    
    # Emergency ride surcharge (already defined as 1.5x in models.py)
    EMERGENCY_MULTIPLIER = 1.5
    
    # Peak hour definitions (for surge pricing simulation)
    PEAK_MORNING = (dt_time(7, 0), dt_time(9, 30))  # 7 AM - 9:30 AM
    PEAK_EVENING = (dt_time(17, 0), dt_time(19, 30))  # 5 PM - 7:30 PM
    PEAK_NIGHT = (dt_time(23, 0), dt_time(2, 0))  # 11 PM - 2 AM (late night)
    
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on Earth
        Returns distance in miles
        
        Args:
            lat1, lon1: Pickup coordinates
            lat2, lon2: Drop coordinates
            
        Returns:
            Distance in miles
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Radius of Earth in miles
        r = 3956
        
        return c * r
    
    @staticmethod
    def estimate_trip_time(distance_miles: float) -> float:
        """
        Estimate trip duration based on distance
        Assumes average city driving speed of 25 mph
        
        Args:
            distance_miles: Trip distance in miles
            
        Returns:
            Estimated time in minutes
        """
        # Average city speed: 25 mph
        # Add 20% buffer for stops, traffic lights, etc.
        avg_speed_mph = 25
        time_hours = distance_miles / avg_speed_mph
        time_minutes = time_hours * 60 * 1.2  # 20% buffer
        
        return time_minutes
    
    @staticmethod
    def calculate_surge_multiplier(current_time: datetime = None, 
                                   queue_length: int = 0,
                                   available_drivers: int = 0) -> float:
        """
        Calculate dynamic surge pricing multiplier
        
        Factors:
        1. Time of day (peak hours)
        2. Queue length (demand)
        3. Available drivers (supply)
        
        Args:
            current_time: Current datetime (defaults to now)
            queue_length: Number of rides in queue
            available_drivers: Number of available drivers
            
        Returns:
            Surge multiplier (1.0 to 3.0)
        """
        if current_time is None:
            current_time = datetime.now()
        
        current_hour_time = current_time.time()
        surge = 1.0
        
        # Time-based surge
        if (PricingCalculator.PEAK_MORNING[0] <= current_hour_time <= PricingCalculator.PEAK_MORNING[1] or
            PricingCalculator.PEAK_EVENING[0] <= current_hour_time <= PricingCalculator.PEAK_EVENING[1]):
            surge += 0.3  # 1.3x during morning/evening rush
        
        if (PricingCalculator.PEAK_NIGHT[0] <= current_hour_time or 
            current_hour_time <= PricingCalculator.PEAK_NIGHT[1]):
            surge += 0.5  # 1.5x for late night
        
        # Demand-based surge (queue length)
        if queue_length > 10:
            surge += 0.2
        if queue_length > 20:
            surge += 0.3
        if queue_length > 30:
            surge += 0.5
        
        # Supply-based surge (low driver availability)
        if available_drivers > 0:
            demand_supply_ratio = queue_length / available_drivers
            if demand_supply_ratio > 2:
                surge += 0.3
            if demand_supply_ratio > 4:
                surge += 0.5
        else:
            # No drivers available - maximum surge
            surge += 1.0
        
        # Cap surge at 3.0x (Uber typically caps at 2.0-3.0x)
        return min(surge, 3.0)
    
    @classmethod
    def calculate_fare(cls,
                      pickup_lat: float,
                      pickup_lon: float,
                      drop_lat: float,
                      drop_lon: float,
                      is_emergency: bool = False,
                      surge_multiplier: float = None,
                      queue_length: int = 0,
                      available_drivers: int = 0) -> Dict:
        """
        Calculate the total fare for a ride
        
        Args:
            pickup_lat, pickup_lon: Pickup coordinates
            drop_lat, drop_lon: Drop coordinates
            is_emergency: Whether this is an emergency ride
            surge_multiplier: Manual surge override (if None, calculates automatically)
            queue_length: Current rides in queue
            available_drivers: Number of available drivers
            
        Returns:
            Dictionary with fare breakdown
        """
        # Calculate distance
        distance_miles = cls.haversine_distance(pickup_lat, pickup_lon, drop_lat, drop_lon)
        
        # Estimate trip time
        estimated_time_minutes = cls.estimate_trip_time(distance_miles)
        
        # Calculate base components
        base_fare = cls.BASE_FARE
        distance_cost = distance_miles * cls.COST_PER_MILE
        time_cost = estimated_time_minutes * cls.COST_PER_MINUTE
        booking_fee = cls.BOOKING_FEE
        
        # Subtotal before multipliers
        subtotal = base_fare + distance_cost + time_cost + booking_fee
        
        # Calculate or use provided surge multiplier
        if surge_multiplier is None:
            surge_multiplier = cls.calculate_surge_multiplier(
                queue_length=queue_length,
                available_drivers=available_drivers
            )
        
        # Apply surge pricing
        fare_after_surge = subtotal * surge_multiplier
        
        # Apply emergency surcharge if applicable
        emergency_multiplier = cls.EMERGENCY_MULTIPLIER if is_emergency else 1.0
        total_fare = fare_after_surge * emergency_multiplier
        
        # Apply minimum fare
        total_fare = max(total_fare, cls.MINIMUM_FARE)
        
        # Build detailed breakdown
        breakdown = {
            "distance_miles": round(distance_miles, 2),
            "estimated_time_minutes": round(estimated_time_minutes, 1),
            "base_fare": round(base_fare, 2),
            "distance_cost": round(distance_cost, 2),
            "time_cost": round(time_cost, 2),
            "booking_fee": round(booking_fee, 2),
            "subtotal": round(subtotal, 2),
            "surge_multiplier": round(surge_multiplier, 2),
            "surge_active": surge_multiplier > 1.0,
            "fare_after_surge": round(fare_after_surge, 2),
            "is_emergency": is_emergency,
            "emergency_multiplier": emergency_multiplier,
            "emergency_surcharge": round(fare_after_surge * (emergency_multiplier - 1), 2) if is_emergency else 0,
            "total_fare": round(total_fare, 2),
            "minimum_fare_applied": total_fare == cls.MINIMUM_FARE
        }
        
        return breakdown


# Convenience function for quick calculations
def calculate_ride_price(pickup_lat: float, pickup_lon: float,
                        drop_lat: float, drop_lon: float,
                        is_emergency: bool = False,
                        queue_length: int = 0,
                        available_drivers: int = 0) -> Dict:
    """
    Quick function to calculate ride price
    
    Returns dictionary with pricing breakdown
    """
    return PricingCalculator.calculate_fare(
        pickup_lat, pickup_lon,
        drop_lat, drop_lon,
        is_emergency,
        queue_length=queue_length,
        available_drivers=available_drivers
    )
