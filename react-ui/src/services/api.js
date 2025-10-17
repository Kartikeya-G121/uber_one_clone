import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const rideAPI = {
  // Ride operations
  requestRide: (rideData) => api.post('/request_ride', rideData),
  requestRideContainer: (rideData) => api.post('/request_ride_container', rideData),
  getUserRides: (userId) => api.get(`/rides/${userId}`),
  addToQueue: (rideData) => api.post('/add_to_queue', rideData),
  
  // Driver operations
  registerDriver: (driverData) => api.post('/register_driver', driverData),
  registerDriversBulk: (driversData) => api.post('/register_drivers_bulk', driversData),
  getAllDrivers: () => api.get('/drivers'),
  getAvailableDrivers: () => api.get('/drivers/available'),
  getDriver: (driverId) => api.get(`/driver/${driverId}`),
  addDriverLocation: (driverId, latitude, longitude) => 
    api.post(`/add_driver_location?driver_id=${driverId}&latitude=${latitude}&longitude=${longitude}`),
  
  // Assignment operations
  assignDriver: () => api.post('/assign_driver'),
  completeRide: (driverId) => api.post(`/complete_ride/${driverId}`),
  getQueueStatus: () => api.get('/queue_status'),
  
  // Container operations
  getRideContainers: () => api.get('/ride_containers'),
  getRideContainer: (rideId) => api.get(`/ride_container/${rideId}`),
  stopRideContainer: (rideId) => api.post(`/ride_container/${rideId}/stop`),
  cleanupContainers: () => api.post('/cleanup_containers'),
};

export default api;