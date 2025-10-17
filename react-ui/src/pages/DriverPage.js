import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Activity, Users } from 'lucide-react';
import Header from '../components/common/Header';
import { rideAPI } from '../services/api';

const DriverPage = () => {
  const [driverData, setDriverData] = useState({
    name: '',
    car_no: '',
    status: 'available'
  });
  const [locationData, setLocationData] = useState({
    driver_id: '',
    latitude: '',
    longitude: ''
  });
  const [driverResult, setDriverResult] = useState('');
  const [locationResult, setLocationResult] = useState('');
  const [rideManagement, setRideManagement] = useState('');
  const [allDrivers, setAllDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const registerDriver = async () => {
    if (!driverData.name || !driverData.car_no) {
      setDriverResult('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await rideAPI.registerDriver(driverData);
      setDriverResult(`✅ Driver Registered Successfully! Driver ID: ${response.data.id}`);
      setDriverData({ name: '', car_no: '', status: 'available' });
      viewAllDrivers();
    } catch (error) {
      setDriverResult(`❌ Error: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  const updateLocation = async () => {
    if (!locationData.driver_id || !locationData.latitude || !locationData.longitude) {
      setLocationResult('❌ Please fill in all location fields');
      return;
    }

    try {
      const response = await rideAPI.addDriverLocation(
        locationData.driver_id, 
        locationData.latitude, 
        locationData.longitude
      );
      setLocationResult(`✅ Location Updated! ${response.data.message}`);
    } catch (error) {
      setLocationResult(`❌ Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const checkForRides = async () => {
    try {
      const response = await rideAPI.getQueueStatus();
      const data = response.data;
      setRideManagement(`
        📊 Current Status:
        🚗 Rides in Queue: ${data.rides_in_queue}
        👥 Available Drivers: ${data.available_drivers}
        ${data.rides_in_queue > 0 ? '🔔 Rides available for pickup!' : '😴 No rides pending'}
      `);
    } catch (error) {
      setRideManagement(`❌ Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const acceptRide = async () => {
    setRideManagement('🔄 Looking for rides to assign...');
    try {
      const response = await rideAPI.assignDriver();
      const result = response.data;
      setRideManagement(`
        ✅ Ride Assigned!
        🚗 Driver ID: ${result.driver.id}
        📍 Distance: ${result.distance_km} km
        ⏱️ ETA: ${result.eta_minutes} minutes
      `);
    } catch (error) {
      setRideManagement(`❌ ${error.response?.data?.detail || 'No rides available for assignment'}`);
    }
  };

  const viewAllDrivers = async () => {
    try {
      const response = await rideAPI.getAllDrivers();
      setAllDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  useEffect(() => {
    viewAllDrivers();
    const interval = setInterval(checkForRides, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Header title="🚙 Uber Driver">
        <Link to="/rider" className="nav-link">Switch to Rider</Link>
      </Header>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="grid grid-3">
          {/* Driver Registration */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={20} />
              Driver Registration
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Full Name"
                className="input"
                value={driverData.name}
                onChange={(e) => setDriverData({...driverData, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Car Number (e.g., ABC-123)"
                className="input"
                value={driverData.car_no}
                onChange={(e) => setDriverData({...driverData, car_no: e.target.value})}
              />
              <select
                className="input"
                value={driverData.status}
                onChange={(e) => setDriverData({...driverData, status: e.target.value})}
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
              
              <button 
                className="btn btn-primary" 
                onClick={registerDriver}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as Driver'}
              </button>
              
              {driverResult && (
                <div style={{ 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #000'
                }}>
                  {driverResult}
                </div>
              )}
            </div>
          </div>

          {/* Location Update */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} />
              Update Location
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="number"
                placeholder="Your Driver ID"
                className="input"
                value={locationData.driver_id}
                onChange={(e) => setLocationData({...locationData, driver_id: e.target.value})}
              />
              <input
                type="number"
                placeholder="Current Latitude"
                className="input"
                value={locationData.latitude}
                onChange={(e) => setLocationData({...locationData, latitude: e.target.value})}
                step="any"
              />
              <input
                type="number"
                placeholder="Current Longitude"
                className="input"
                value={locationData.longitude}
                onChange={(e) => setLocationData({...locationData, longitude: e.target.value})}
                step="any"
              />
              
              <button className="btn btn-primary" onClick={updateLocation}>
                Update Location
              </button>
              
              {locationResult && (
                <div style={{ 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #000'
                }}>
                  {locationResult}
                </div>
              )}
            </div>
          </div>

          {/* Ride Management */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} />
              Ride Management
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={checkForRides}>
                Check for Ride Requests
              </button>
              <button className="btn btn-primary" onClick={acceptRide}>
                Accept Next Ride
              </button>
              
              {rideManagement && (
                <div style={{ 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #000',
                  whiteSpace: 'pre-line'
                }}>
                  {rideManagement}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Drivers */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} />
            All Drivers ({allDrivers.length})
          </h3>
          <button className="btn btn-secondary" onClick={viewAllDrivers} style={{ marginBottom: '1rem' }}>
            Refresh Drivers
          </button>
          <div className="grid grid-3">
            {allDrivers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No drivers registered</p>
            ) : (
              allDrivers.map(driver => {
                const statusColor = driver.status === 'available' ? '#28a745' : 
                                  driver.status === 'busy' ? '#ffc107' : '#dc3545';
                return (
                  <div key={driver.id} style={{ 
                    padding: '1rem', 
                    background: '#f8f9fa', 
                    borderRadius: '6px',
                    borderLeft: `4px solid ${statusColor}`
                  }}>
                    <strong>👤 {driver.name}</strong><br />
                    🚗 Car: {driver.car_no}<br />
                    📊 Status: {driver.status}<br />
                    🆔 ID: {driver.id}
                    {driver.latitude && driver.longitude && (
                      <><br />📍 Location: {driver.latitude}, {driver.longitude}</>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;