import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Activity, Users, DollarSign, TrendingUp, Star, Zap, AlertCircle } from 'lucide-react';
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
  const [queueStatus, setQueueStatus] = useState(null);
  const [allDrivers, setAllDrivers] = useState([]);
  const [activeRides, setActiveRides] = useState([]);
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
      setQueueStatus(data);
      const ridesCount = data.total_rides || data.rides_in_queue || 0;
      setRideManagement(`📊 Current Status:
🚗 Rides in Queue: ${ridesCount}
🚨 Emergency: ${data.emergency_count || 0}
📋 Normal: ${data.normal_count || 0}
👥 Available Drivers: ${data.available_drivers}
${ridesCount > 0 ? '🔔 Rides available for pickup!' : '😴 No rides pending'}`);
    } catch (error) {
      setRideManagement(`❌ Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const acceptRide = async () => {
    setRideManagement('🔄 Looking for rides to assign...');
    try {
      const response = await rideAPI.assignDriver();
      const result = response.data;
      setRideManagement(`✅ Ride Assigned!
🚗 Driver ID: ${result.driver.id}
📍 Distance: ${result.distance_km} km
⏱️ ETA: ${result.eta_minutes} minutes`);
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

  const getActiveRides = async () => {
    if (!locationData.driver_id) return;

    try {
      const response = await rideAPI.getDriverActiveRides(locationData.driver_id);
      setActiveRides(response.data);
    } catch (error) {
      console.error('Error fetching active rides:', error);
    }
  };

  const endRide = async (rideId) => {
    try {
      await rideAPI.endRide(rideId);
      setRideManagement(`✅ Ride ${rideId} completed successfully!`);
      getActiveRides();
    } catch (error) {
      setRideManagement(`❌ Error ending ride: ${error.response?.data?.detail || error.message}`);
    }
  };

  useEffect(() => {
    viewAllDrivers();
    checkForRides();
    const interval = setInterval(() => {
      checkForRides();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (locationData.driver_id) {
      getActiveRides();
      const interval = setInterval(getActiveRides, 10000);
      return () => clearInterval(interval);
    }
  }, [locationData.driver_id]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': return 'badge-success';
      case 'busy': return 'badge-warning';
      case 'offline': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Header title="🚙 Uber Driver">
        <Link to="/rider" className="nav-link">Switch to Rider</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
      </Header>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>

        {/* Queue Status Cards */}
        {queueStatus && (
          <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
            <div className="card" style={{ textAlign: 'center', background: 'var(--gradient-card)' }}>
              <Activity size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--uber-green)' }} />
              <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
                {(queueStatus.total_rides || queueStatus.rides_in_queue || 0)}
              </h3>
              <p style={{ color: 'var(--gray-600)', margin: 0, fontWeight: 500 }}>Rides in Queue</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: 'var(--emergency-bg)', borderColor: 'var(--emergency-border)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--emergency-red)' }} />
              <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 800, color: 'var(--emergency-text)' }}>
                {queueStatus.emergency_count || 0}
              </h3>
              <p style={{ color: 'var(--error-text)', margin: 0, fontWeight: 500 }}>🚨 Emergency Rides</p>
            </div>

            <div className="card" style={{ textAlign: 'center', background: 'var(--gradient-card)' }}>
              <Users size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--info)' }} />
              <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
                {queueStatus.available_drivers || 0}
              </h3>
              <p style={{ color: 'var(--gray-600)', margin: 0, fontWeight: 500 }}>Available Drivers</p>
            </div>
          </div>
        )}

        {/* Active Rides Banner */}
        {activeRides.length > 0 && (
          <div className="card" style={{
            background: 'var(--gradient-green)',
            color: 'white',
            marginBottom: '1.5rem',
            border: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Zap size={32} />
                <div>
                  <h3 style={{ margin: 0, color: 'white' }}>You have active rides!</h3>
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>
                    {activeRides.length} ride{activeRides.length > 1 ? 's' : ''} in progress
                  </p>
                </div>
              </div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: 'none' }}>
                ACTIVE
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-3">
          {/* Driver Registration */}
          <div className="card">
            <div className="card-header">
              <Car size={20} />
              <h3>Driver Registration</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">👤 Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="input"
                  value={driverData.name}
                  onChange={(e) => setDriverData({ ...driverData, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">🚗 Car Number</label>
                <input
                  type="text"
                  placeholder="e.g., ABC-123"
                  className="input"
                  value={driverData.car_no}
                  onChange={(e) => setDriverData({ ...driverData, car_no: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">📊 Status</label>
                <select
                  className="input"
                  value={driverData.status}
                  onChange={(e) => setDriverData({ ...driverData, status: e.target.value })}
                >
                  <option value="available">✅ Available</option>
                  <option value="busy">⚠️ Busy</option>
                  <option value="offline">❌ Offline</option>
                </select>
              </div>

              <button
                className="btn btn-success"
                onClick={registerDriver}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white' }}></div>
                    Registering...
                  </>
                ) : (
                  '✨ Register as Driver'
                )}
              </button>

              {driverResult && (
                <div style={{
                  padding: '0.875rem',
                  background: driverResult.includes('❌') ? 'var(--error-bg)' : 'var(--success-bg)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${driverResult.includes('❌') ? 'var(--error)' : 'var(--success)'}`,
                  fontSize: '0.875rem',
                  color: driverResult.includes('❌') ? 'var(--error-text)' : 'var(--success-text)'
                }}>
                  {driverResult}
                </div>
              )}
            </div>
          </div>

          {/* Location Update */}
          <div className="card">
            <div className="card-header">
              <MapPin size={20} />
              <h3>Update Location</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">🆔 Your Driver ID</label>
                <input
                  type="number"
                  placeholder="Enter driver ID"
                  className="input"
                  value={locationData.driver_id}
                  onChange={(e) => setLocationData({ ...locationData, driver_id: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">📍 Current Latitude</label>
                <input
                  type="number"
                  placeholder="e.g., 40.7128"
                  className="input"
                  value={locationData.latitude}
                  onChange={(e) => setLocationData({ ...locationData, latitude: e.target.value })}
                  step="any"
                />
              </div>

              <div className="input-group">
                <label className="input-label">📍 Current Longitude</label>
                <input
                  type="number"
                  placeholder="e.g., -74.0060"
                  className="input"
                  value={locationData.longitude}
                  onChange={(e) => setLocationData({ ...locationData, longitude: e.target.value })}
                  step="any"
                />
              </div>

              <button className="btn btn-primary" onClick={updateLocation}>
                📍 Update Location
              </button>

              {locationResult && (
                <div style={{
                  padding: '0.875rem',
                  background: locationResult.includes('❌') ? 'var(--error-bg)' : 'var(--success-bg)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${locationResult.includes('❌') ? 'var(--error)' : 'var(--success)'}`,
                  fontSize: '0.875rem',
                  color: locationResult.includes('❌') ? 'var(--error-text)' : 'var(--success-text)'
                }}>
                  {locationResult}
                </div>
              )}
            </div>
          </div>

          {/* Ride Management */}
          <div className="card">
            <div className="card-header">
              <Activity size={20} />
              <h3>Ride Management</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={checkForRides}>
                🔄 Check for Rides
              </button>
              <button className="btn btn-success" onClick={acceptRide}>
                ✅ Accept Next Ride
              </button>

              {rideManagement && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--gray-100)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--info)',
                  whiteSpace: 'pre-line',
                  fontSize: '0.875rem',
                  color: 'var(--gray-800)'
                }}>
                  {rideManagement}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Rides Section */}
        {activeRides.length > 0 && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-header">
              <Zap size={20} />
              <h3>Your Active Rides</h3>
              <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>
                {activeRides.length} Active
              </span>
            </div>

            <div className="grid grid-2">
              {activeRides.map(ride => (
                <div key={ride.ride_id} style={{
                  padding: '1.25rem',
                  background: 'var(--gradient-green)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'white' }}>Ride #{ride.ride_id}</h4>
                      <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Container Port: {ride.port}</span>
                    </div>
                    <span className="badge badge-pulse" style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: 'none' }}>
                      IN PROGRESS
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', opacity: 0.95, marginBottom: '1rem' }}>
                    <p style={{ margin: '0.5rem 0' }}>📍 From: {ride.pickup_location}</p>
                    <p style={{ margin: '0.5rem 0' }}>🎯 To: {ride.drop_location}</p>
                    <p style={{ margin: '0.5rem 0' }}>🔗 URL: <a href={ride.url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{ride.url}</a></p>
                  </div>

                  <button
                    className="btn"
                    onClick={() => endRide(ride.ride_id)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}
                  >
                    ✓ Complete Ride
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Drivers */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <Users size={20} />
            <h3>All Registered Drivers</h3>
            <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
              {allDrivers.length} Total
            </span>
          </div>

          <button className="btn btn-outline btn-sm" onClick={viewAllDrivers} style={{ marginBottom: '1.5rem', width: '100%' }}>
            🔄 Refresh Drivers
          </button>

          <div className="grid grid-3">
            {allDrivers.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--gray-500)'
              }}>
                <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: 500 }}>No drivers registered</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Register as a driver to get started</p>
              </div>
            ) : (
              allDrivers.map(driver => (
                <div key={driver.id} style={{
                  padding: '1.25rem',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${driver.status === 'available' ? 'var(--success)' :
                      driver.status === 'busy' ? 'var(--warning)' :
                        'var(--error)'
                    }`,
                  transition: 'all var(--transition-base)'
                }}
                  className="card-interactive">
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '1rem' }}>👤 {driver.name}</strong>
                      <span className={`badge ${getStatusBadgeClass(driver.status)}`}>
                        {driver.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      🚗 Car: {driver.car_no}
                    </p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      🆔 ID: {driver.id}
                    </p>
                    {driver.latitude && driver.longitude && (
                      <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        📍 {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverPage;