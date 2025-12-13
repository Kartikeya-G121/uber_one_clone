import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Clock, Car, AlertTriangle, Users, Zap } from 'lucide-react';
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
  const [activeRides, setActiveRides] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [applySurge, setApplySurge] = useState(true);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const handleInputChange = (e) => {
    setRideData({ ...rideData, [e.target.name]: e.target.value });
    // Clear price estimate when coordinates change
    setPriceEstimate(null);
  };

  const calculatePrice = async () => {
    // Validate all coordinates are provided
    if (!rideData.pickup_lat || !rideData.pickup_lon || !rideData.drop_lat || !rideData.drop_lon) {
      return;
    }

    setLoadingPrice(true);
    try {
      const response = await rideAPI.calculatePrice({
        pickup_lat: parseFloat(rideData.pickup_lat),
        pickup_lon: parseFloat(rideData.pickup_lon),
        drop_lat: parseFloat(rideData.drop_lat),
        drop_lon: parseFloat(rideData.drop_lon),
        is_emergency: isEmergency,
        apply_surge: applySurge
      });
      setPriceEstimate(response.data.pricing);
    } catch (error) {
      console.error('Error calculating price:', error);
      setPriceEstimate(null);
    }
    setLoadingPrice(false);
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

      // Auto add to queue with priority
      const queuePayload = { ...rideData, priority: isEmergency ? 'EMERGENCY' : 'NORMAL' };
      await rideAPI.addToQueue(queuePayload);
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
      const endpoint = isEmergency ? '/request_emergency_ride_container' : '/request_ride_container';
      const ridePayload = { ...rideData, priority: isEmergency ? 'EMERGENCY' : 'NORMAL' };

      const response = await rideAPI.requestRideContainer(ridePayload, endpoint);

      if (isEmergency) {
        setRideStatus(`🚨 EMERGENCY Container Spawned!\n` +
          `✅ Guaranteed by: ${response.data.guaranteed_by}\n` +
          `💰 Surcharge: ${response.data.emergency_surcharge}\n` +
          `🐳 Port: ${response.data.container_port}\n` +
          `🖥️ Resources: ${response.data.container_resources}\n` +
          `🌐 URL: ${response.data.container_url}`);
      } else {
        setRideStatus(`🐳 Container Ride Created! Port: ${response.data.container_port}, URL: ${response.data.container_url}`);
      }
    } catch (error) {
      setRideStatus(`❌ Error: ${error.response?.data?.detail || error.message}`);
    }
    setLoading(false);
  };

  const getUserRides = async () => {
    if (!rideData.user_id) {
      setRideStatus('⚠️ Please enter your User ID first');
      return;
    }

    try {
      const response = await rideAPI.getUserRides(rideData.user_id);
      setUserRides(response.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const getActiveRides = async () => {
    if (!rideData.user_id) return;

    try {
      const response = await rideAPI.getUserActiveRides(rideData.user_id);
      setActiveRides(response.data);
    } catch (error) {
      console.error('Error fetching active rides:', error);
    }
  };

  const endRide = async (rideId) => {
    try {
      await rideAPI.endRide(rideId);
      setRideStatus(`✅ Ride ${rideId} ended successfully!`);
      getActiveRides();
      getUserRides();
    } catch (error) {
      setRideStatus(`❌ Error ending ride: ${error.response?.data?.detail || error.message}`);
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

  useEffect(() => {
    if (rideData.user_id) {
      getActiveRides();
      const interval = setInterval(getActiveRides, 10000);
      return () => clearInterval(interval);
    }
  }, [rideData.user_id]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Header title="🚗 Uber Rider">
        <Link to="/driver" className="nav-link">Switch to Driver</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
      </Header>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>

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
                  <h3 style={{ margin: 0, color: 'white' }}>Active Ride in Progress</h3>
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>
                    {activeRides.length} active ride{activeRides.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: 'none' }}>
                LIVE
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-2">
          {/* Ride Request Form */}
          <div className="card">
            <div className="card-header">
              <Navigation size={24} />
              <h3>Where to?</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* User ID Input */}
              <div className="input-group">
                <label className="input-label">👤 Your User ID</label>
                <input
                  type="number"
                  name="user_id"
                  placeholder="Enter your user ID"
                  className="input"
                  value={rideData.user_id}
                  onChange={handleInputChange}
                />
              </div>

              {/* Pickup Location */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  style={{ marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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

              {/* Drop Location */}
              <div>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  style={{ marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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

              {/* Emergency Toggle */}
              <div style={{
                padding: '1rem',
                background: isEmergency ? 'var(--emergency-bg)' : 'var(--gray-100)',
                borderRadius: 'var(--radius-md)',
                border: isEmergency ? '2px solid var(--emergency-border)' : '2px solid var(--gray-200)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all var(--transition-base)'
              }}>
                <input
                  type="checkbox"
                  id="emergency-toggle"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--emergency-red)' }}
                />
                <label htmlFor="emergency-toggle" style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0,
                  fontWeight: isEmergency ? 700 : 500,
                  color: isEmergency ? 'var(--emergency-text)' : 'var(--gray-700)',
                  flex: 1
                }}>
                  <AlertTriangle size={20} color={isEmergency ? 'var(--emergency-red)' : 'var(--gray-400)'} />
                  🚨 Emergency Ride
                  {isEmergency && <span className="badge badge-error" style={{ marginLeft: 'auto' }}>+50% FARE</span>}
                </label>
              </div>

              {/* Surge Pricing Toggle */}
              <div style={{
                padding: '1rem',
                background: applySurge ? 'rgba(255, 215, 0, 0.1)' : 'var(--gray-100)',
                borderRadius: 'var(--radius-md)',
                border: applySurge ? '2px solid #FFD700' : '2px solid var(--gray-200)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '0.75rem',
                transition: 'all var(--transition-base)'
              }}>
                <input
                  type="checkbox"
                  id="surge-toggle"
                  checked={applySurge}
                  onChange={(e) => {
                    setApplySurge(e.target.checked);
                    setPriceEstimate(null); // Clear price when toggling
                  }}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#FFD700' }}
                />
                <label htmlFor="surge-toggle" style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0,
                  fontWeight: applySurge ? 700 : 500,
                  color: applySurge ? '#B8860B' : 'var(--gray-700)',
                  flex: 1
                }}>
                  <Zap size={20} color={applySurge ? '#FFD700' : 'var(--gray-400)'} fill={applySurge ? '#FFD700' : 'none'} />
                  ⚡ Apply Surge Pricing
                  {applySurge && <span className="badge" style={{
                    marginLeft: 'auto',
                    background: '#FFD700',
                    color: '#000',
                    fontWeight: '700'
                  }}>DYNAMIC</span>}
                </label>
              </div>

              {/* Price Estimate Button */}
              <button
                className="btn btn-outline"
                onClick={calculatePrice}
                disabled={loadingPrice || !rideData.pickup_lat || !rideData.pickup_lon || !rideData.drop_lat || !rideData.drop_lon}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}
              >
                {loadingPrice ? (
                  <>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    💰 Calculate Price Estimate
                  </>
                )}
              </button>

              {/* Price Estimate Display */}
              {priceEstimate && (
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, var(--uber-green-light) 0%, var(--uber-green) 100%)',
                  borderRadius: 'var(--radius-lg)',
                  marginTop: '1rem',
                  boxShadow: '0 4px 20px rgba(6, 193, 103, 0.2)',
                  border: '2px solid var(--uber-green)'
                }}>
                  {/* Total Fare - Large Display */}
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', opacity: 0.9, marginBottom: '0.25rem' }}>
                      Estimated Fare
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: 'white', lineHeight: '1' }}>
                      ${priceEstimate.total_fare.toFixed(2)}
                    </div>
                    {priceEstimate.minimum_fare_applied && (
                      <div style={{ fontSize: '0.75rem', color: 'white', opacity: 0.8, marginTop: '0.25rem' }}>
                        (Minimum fare applied)
                      </div>
                    )}
                  </div>

                  {/* Trip Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                        {priceEstimate.distance_miles.toFixed(1)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'white', opacity: 0.9 }}>miles</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                        {Math.round(priceEstimate.estimated_time_minutes)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'white', opacity: 0.9 }}>minutes</div>
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <details style={{ marginTop: '1rem' }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontWeight: '600',
                      color: 'white',
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>View Fare Breakdown</span>
                      <span>▼</span>
                    </summary>
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'white' }}>
                        <span>Base Fare:</span>
                        <span>${priceEstimate.base_fare.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'white' }}>
                        <span>Distance ({priceEstimate.distance_miles.toFixed(1)} mi):</span>
                        <span>${priceEstimate.distance_cost.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'white' }}>
                        <span>Time ({Math.round(priceEstimate.estimated_time_minutes)} min):</span>
                        <span>${priceEstimate.time_cost.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'white' }}>
                        <span>Booking Fee:</span>
                        <span>${priceEstimate.booking_fee.toFixed(2)}</span>
                      </div>
                      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.3)', margin: '0.5rem 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'white' }}>
                        <span>Subtotal:</span>
                        <span>${priceEstimate.subtotal.toFixed(2)}</span>
                      </div>

                      {/* Surge Pricing */}
                      {priceEstimate.surge_active && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#FFD700', fontWeight: '600' }}>
                          <span>⚡ Surge Pricing ({priceEstimate.surge_multiplier}x):</span>
                          <span>+${(priceEstimate.fare_after_surge - priceEstimate.subtotal).toFixed(2)}</span>
                        </div>
                      )}

                      {/* Emergency Surcharge */}
                      {priceEstimate.is_emergency && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#ff416c', fontWeight: '600' }}>
                          <span>🚨 Emergency Surcharge (+50%):</span>
                          <span>+${priceEstimate.emergency_surcharge.toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ height: '2px', background: 'rgba(255, 255, 255, 0.4)', margin: '0.75rem 0' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '700', color: 'white' }}>
                        <span>Total:</span>
                        <span>${priceEstimate.total_fare.toFixed(2)}</span>
                      </div>
                    </div>
                  </details>

                  {/* Surge/Emergency Indicators */}
                  {(priceEstimate.surge_active || priceEstimate.is_emergency) && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {priceEstimate.surge_active && (
                        <span className="badge" style={{
                          background: '#FFD700',
                          color: '#000',
                          fontWeight: '700',
                          padding: '0.5rem 0.75rem'
                        }}>
                          ⚡ {priceEstimate.surge_multiplier}x Surge Pricing
                        </span>
                      )}
                      {priceEstimate.is_emergency && (
                        <span className="badge badge-error" style={{
                          fontWeight: '700',
                          padding: '0.5rem 0.75rem'
                        }}>
                          🚨 Emergency +50%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  className={isEmergency ? "btn btn-emergency" : "btn btn-primary"}
                  onClick={requestRide}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                      Requesting...
                    </>
                  ) : (
                    isEmergency ? '🚨 Emergency Ride' : '🚗 Request Ride'
                  )}
                </button>
                <button
                  className={isEmergency ? "btn btn-emergency" : "btn btn-secondary"}
                  onClick={requestRideContainer}
                  disabled={loading}
                >
                  {isEmergency ? '🚨 Emergency Container' : '🐳 Container Ride'}
                </button>
              </div>

              {/* Status Message */}
              {rideStatus && (
                <div style={{
                  padding: '1rem',
                  background: rideStatus.includes('❌') ? 'var(--error-bg)' : 'var(--success-bg)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${rideStatus.includes('❌') ? 'var(--error)' : 'var(--success)'}`,
                  whiteSpace: 'pre-line',
                  fontSize: '0.875rem',
                  color: rideStatus.includes('❌') ? 'var(--error-text)' : 'var(--success-text)'
                }}>
                  {rideStatus}
                </div>
              )}
            </div>
          </div>

          {/* Available Drivers */}
          <div className="card">
            <div className="card-header">
              <Car size={20} />
              <h3>Available Drivers</h3>
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                {availableDrivers.length}
              </span>
            </div>

            <button className="btn btn-outline btn-sm" onClick={getAvailableDrivers} style={{ marginBottom: '1rem', width: '100%' }}>
              🔄 Refresh Drivers
            </button>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {availableDrivers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
                  <Car size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>No drivers available</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Please try again later</p>
                </div>
              ) : (
                availableDrivers.map(driver => (
                  <div key={driver.id} style={{
                    padding: '1rem',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.75rem',
                    borderLeft: '4px solid var(--uber-green)',
                    transition: 'all var(--transition-base)'
                  }}
                    className="card-interactive">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '1rem' }}>🚗 {driver.name}</strong>
                          <span className="badge badge-success badge-pulse">Available</span>
                        </div>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          🚙 Car: {driver.car_no}
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          🆔 Driver ID: {driver.id}
                        </p>
                        {driver.latitude && driver.longitude && (
                          <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            📍 {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active Rides Section */}
        {activeRides.length > 0 && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-header">
              <Zap size={20} />
              <h3>Active Rides</h3>
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
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white', border: 'none' }}>
                      ACTIVE
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', opacity: 0.95, marginBottom: '1rem' }}>
                    <p style={{ margin: '0.5rem 0' }}>📍 From: {ride.pickup_location}</p>
                    <p style={{ margin: '0.5rem 0' }}>🎯 To: {ride.drop_location}</p>
                    <p style={{ margin: '0.5rem 0' }}>🔗 URL: <a href={ride.url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{ride.url}</a></p>
                  </div>

                  <button
                    className="btn btn-outline"
                    onClick={() => endRide(ride.ride_id)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}
                  >
                    End Ride
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ride History */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <Clock size={20} />
            <h3>Your Ride History</h3>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">User ID</label>
              <input
                type="number"
                placeholder="Enter User ID"
                className="input"
                value={rideData.user_id}
                onChange={(e) => setRideData({ ...rideData, user_id: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={getUserRides}>
              📊 View My Rides
            </button>
          </div>

          <div>
            {userRides.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
                <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: 500 }}>No rides found</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Your trip history will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {userRides.map(ride => (
                  <div key={ride.id} style={{
                    padding: '1.25rem',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--info)',
                    transition: 'all var(--transition-base)'
                  }}
                    className="card-interactive">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <strong style={{ fontSize: '1.1rem' }}>Ride #{ride.id}</strong>
                          {ride.priority === 'EMERGENCY' && (
                            <span className="badge badge-error">🚨 EMERGENCY</span>
                          )}
                        </div>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          📍 <strong>From:</strong> {ride.pickup_location}
                        </p>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                          🎯 <strong>To:</strong> {ride.drop_location}
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          🕐 {new Date(ride.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderPage;