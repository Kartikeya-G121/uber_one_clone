import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Clock, Car } from 'lucide-react';
import Header from '../components/common/Header';
import { rideAPI } from '../services/api';

const RiderPage = () => {
  const [rideData, setRideData] = useState({
    user_id: '',
    pickup_location: '',
    drop_location: '',
    pickup_lat: '',
    pickup_lon: '',
    drop_lat: '',
    drop_lon: ''
  });
  const [rideStatus, setRideStatus] = useState('');
  const [userRides, setUserRides] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setRideData({ ...rideData, [e.target.name]: e.target.value });
  };

  const requestRide = async () => {
    if (!rideData.user_id || !rideData.pickup_location || !rideData.drop_location) {
      setRideStatus('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await rideAPI.requestRide(rideData);
      setRideStatus(`✅ Ride Requested Successfully! Ride ID: ${response.data.id}`);
      
      // Auto add to queue
      await rideAPI.addToQueue(rideData);
    } catch (error) {
      setRideStatus(`❌ Error: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  const requestRideContainer = async () => {
    if (!rideData.user_id || !rideData.pickup_location || !rideData.drop_location) {
      setRideStatus('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await rideAPI.requestRideContainer(rideData);
      setRideStatus(`🐳 Container Ride Created! Port: ${response.data.container_port}, URL: ${response.data.container_url}`);
    } catch (error) {
      setRideStatus(`❌ Error: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  const getUserRides = async () => {
    if (!rideData.user_id) {
      alert('Please enter User ID');
      return;
    }

    try {
      const response = await rideAPI.getUserRides(rideData.user_id);
      setUserRides(response.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const getAvailableDrivers = async () => {
    try {
      const response = await rideAPI.getAvailableDrivers();
      setAvailableDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  useEffect(() => {
    getAvailableDrivers();
    const interval = setInterval(getAvailableDrivers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Header title="🚗 Uber Rider">
        <Link to="/driver" className="nav-link">Switch to Driver</Link>
      </Header>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="grid grid-2">
          {/* Ride Request Form */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Navigation size={24} />
              Where to?
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="number"
                name="user_id"
                placeholder="Your User ID"
                className="input"
                value={rideData.user_id}
                onChange={handleInputChange}
              />
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MapPin size={16} />
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickup_location"
                  placeholder="Enter pickup address"
                  className="input"
                  value={rideData.pickup_location}
                  onChange={handleInputChange}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="number"
                    name="pickup_lat"
                    placeholder="Latitude"
                    className="input"
                    value={rideData.pickup_lat}
                    onChange={handleInputChange}
                    step="any"
                  />
                  <input
                    type="number"
                    name="pickup_lon"
                    placeholder="Longitude"
                    className="input"
                    value={rideData.pickup_lon}
                    onChange={handleInputChange}
                    step="any"
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Navigation size={16} />
                  Drop Location
                </label>
                <input
                  type="text"
                  name="drop_location"
                  placeholder="Enter destination"
                  className="input"
                  value={rideData.drop_location}
                  onChange={handleInputChange}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="number"
                    name="drop_lat"
                    placeholder="Latitude"
                    className="input"
                    value={rideData.drop_lat}
                    onChange={handleInputChange}
                    step="any"
                  />
                  <input
                    type="number"
                    name="drop_lon"
                    placeholder="Longitude"
                    className="input"
                    value={rideData.drop_lon}
                    onChange={handleInputChange}
                    step="any"
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={requestRide}
                  disabled={loading}
                >
                  {loading ? 'Requesting...' : 'Request Ride'}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={requestRideContainer}
                  disabled={loading}
                >
                  🐳 Container Ride
                </button>
              </div>
              
              {rideStatus && (
                <div style={{ 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #000'
                }}>
                  {rideStatus}
                </div>
              )}
            </div>
          </div>

          {/* Available Drivers */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={20} />
              Available Drivers ({availableDrivers.length})
            </h3>
            <button className="btn btn-secondary" onClick={getAvailableDrivers} style={{ marginBottom: '1rem' }}>
              Refresh Drivers
            </button>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {availableDrivers.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No drivers available</p>
              ) : (
                availableDrivers.map(driver => (
                  <div key={driver.id} style={{ 
                    padding: '1rem', 
                    background: '#f8f9fa', 
                    borderRadius: '6px',
                    marginBottom: '0.5rem',
                    borderLeft: '4px solid #007bff'
                  }}>
                    <strong>🚗 {driver.name}</strong><br />
                    🚙 Car: {driver.car_no}<br />
                    📍 Status: {driver.status}<br />
                    🆔 Driver ID: {driver.id}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ride History */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} />
            Your Rides
          </h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="number"
              placeholder="Enter User ID"
              className="input"
              value={rideData.user_id}
              onChange={(e) => setRideData({...rideData, user_id: e.target.value})}
              style={{ maxWidth: '200px' }}
            />
            <button className="btn btn-secondary" onClick={getUserRides}>
              View My Rides
            </button>
          </div>
          <div>
            {userRides.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>No rides found</p>
            ) : (
              userRides.map(ride => (
                <div key={ride.id} style={{ 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  borderLeft: '4px solid #28a745'
                }}>
                  <strong>Ride #{ride.id}</strong><br />
                  📍 From: {ride.pickup_location}<br />
                  🎯 To: {ride.drop_location}<br />
                  🕐 {new Date(ride.created_at).toLocaleString()}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderPage;