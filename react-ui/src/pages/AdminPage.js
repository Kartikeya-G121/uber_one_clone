import React, { useState, useEffect } from 'react';
import { Settings, Container, BarChart3 } from 'lucide-react';
import Header from '../components/common/Header';
import { rideAPI } from '../services/api';

const AdminPage = () => {
  const [containers, setContainers] = useState([]);
  const [queueStatus, setQueueStatus] = useState({});
  const [queueDetails, setQueueDetails] = useState({ emergency_rides: [], normal_rides: [] });
  const [loading, setLoading] = useState(false);

  const getRideContainers = async () => {
    try {
      const response = await rideAPI.getRideContainers();
      setContainers(response.data.containers || []);
    } catch (error) {
      console.error('Error fetching containers:', error);
    }
  };

  const getQueueStatus = async () => {
    try {
      const response = await rideAPI.getQueueStatus();
      setQueueStatus(response.data);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const getQueueDetails = async () => {
    try {
      const response = await rideAPI.getQueueDetails();
      setQueueDetails(response.data);
    } catch (error) {
      console.error('Error fetching queue details:', error);
    }
  };

  const stopContainer = async (rideId) => {
    setLoading(true);
    try {
      await rideAPI.stopRideContainer(rideId);
      getRideContainers();
    } catch (error) {
      console.error('Error stopping container:', error);
    }
    setLoading(false);
  };

  const cleanupAllContainers = async () => {
    if (!window.confirm('Are you sure you want to stop all containers?')) return;
    
    setLoading(true);
    try {
      await rideAPI.cleanupContainers();
      getRideContainers();
    } catch (error) {
      console.error('Error cleaning up containers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRideContainers();
    getQueueStatus();
    getQueueDetails();
    const interval = setInterval(() => {
      getRideContainers();
      getQueueStatus();
      getQueueDetails();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Header title="🔧 Uber Quick Admin Panel" />

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {/* Stats Overview */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <Container size={32} style={{ margin: '0 auto 1rem', color: '#000' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{containers.length}</h3>
            <p style={{ color: '#666' }}>Active Containers</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <BarChart3 size={32} style={{ margin: '0 auto 1rem', color: '#000' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {queueStatus.total_rides || queueStatus.rides_in_queue || 0}
            </h3>
            <p style={{ color: '#666' }}>Rides in Queue</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <Settings size={32} style={{ margin: '0 auto 1rem', color: '#000' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{queueStatus.available_drivers || 0}</h3>
            <p style={{ color: '#666' }}>Available Drivers</p>
          </div>
        </div>

        {/* Ride Queue Display */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={20} />
            Ride Queue
          </h3>

          {queueDetails.total_rides === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <BarChart3 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No rides in queue</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Rides will appear here when passengers request them
              </p>
            </div>
          ) : (
            <>
              {/* Emergency Rides Section */}
              {queueDetails.emergency_rides && queueDetails.emergency_rides.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ 
                    color: '#dc3545', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🚨 Emergency Rides ({queueDetails.total_emergency})
                  </h4>
                  <div className="grid grid-2">
                    {queueDetails.emergency_rides.map((ride, index) => (
                      <div key={`emergency-${index}`} className="card" style={{ 
                        background: '#fff5f5',
                        border: '2px solid #dc3545'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ color: '#dc3545' }}>Ride #{ride.id || 'N/A'}</h4>
                          <span style={{ 
                            background: '#dc3545', 
                            color: 'white', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            EMERGENCY
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                          <p><strong>👤 User ID:</strong> {ride.user_id || 'N/A'}</p>
                          <p><strong>📍 Pickup:</strong> {ride.pickup ? `(${ride.pickup[0]}, ${ride.pickup[1]})` : 'N/A'}</p>
                          <p><strong>🎯 Destination:</strong> {ride.destination ? `(${ride.destination[0]}, ${ride.destination[1]})` : 'N/A'}</p>
                          {ride.queued_at && (
                            <p><strong>🕐 Queued:</strong> {new Date(ride.queued_at).toLocaleTimeString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Normal Rides Section */}
              {queueDetails.normal_rides && queueDetails.normal_rides.length > 0 && (
                <div>
                  <h4 style={{ 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    🚗 Normal Rides ({queueDetails.total_normal})
                  </h4>
                  <div className="grid grid-2">
                    {queueDetails.normal_rides.map((ride, index) => (
                      <div key={`normal-${index}`} className="card" style={{ background: '#f8f9fa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4>Ride #{ride.id || 'N/A'}</h4>
                          <span style={{ 
                            background: '#6c757d', 
                            color: 'white', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '12px',
                            fontSize: '0.8rem'
                          }}>
                            NORMAL
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                          <p><strong>👤 User ID:</strong> {ride.user_id || 'N/A'}</p>
                          <p><strong>📍 Pickup:</strong> {ride.pickup ? `(${ride.pickup[0]}, ${ride.pickup[1]})` : 'N/A'}</p>
                          <p><strong>🎯 Destination:</strong> {ride.destination ? `(${ride.destination[0]}, ${ride.destination[1]})` : 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Container Management */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Container size={20} />
              Active Ride Containers
            </h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={getRideContainers}>
                Refresh
              </button>
              <button 
                className="btn btn-primary" 
                onClick={cleanupAllContainers}
                disabled={loading || containers.length === 0}
                style={{ background: '#dc3545' }}
              >
                {loading ? 'Cleaning...' : 'Cleanup All'}
              </button>
            </div>
          </div>

          {containers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <Container size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>No active containers</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Request a ride with container to see them here
              </p>
            </div>
          ) : (
            <div className="grid grid-2">
              {containers.map(container => (
                <div key={container.ride_id} className="card" style={{ background: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ marginBottom: '0.5rem' }}>Ride #{container.ride_id}</h4>
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Container: {container.container_id}
                      </p>
                    </div>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => stopContainer(container.ride_id)}
                      disabled={loading}
                      style={{ background: '#dc3545', color: 'white', padding: '0.5rem 1rem' }}
                    >
                      Stop
                    </button>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <p><strong>🌐 URL:</strong> <a href={container.url} target="_blank" rel="noopener noreferrer">{container.url}</a></p>
                    <p><strong>🔌 Port:</strong> {container.host_port}</p>
                    <p><strong>👤 User:</strong> {container.user_id}</p>
                    <p><strong>📍 From:</strong> {container.pickup}</p>
                    <p><strong>🎯 To:</strong> {container.drop}</p>
                    <p><strong>🕐 Started:</strong> {new Date(container.started_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div className="grid grid-2">
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Container Commands</h4>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                <p># View all containers</p>
                <p>curl http://localhost:8000/ride_containers</p>
                <br />
                <p># Check Docker</p>
                <p>docker ps | grep uber-ride</p>
                <br />
                <p># View logs</p>
                <p>docker logs uber-ride-1</p>
              </div>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>API Endpoints</h4>
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                <p><strong>POST</strong> /request_ride_container</p>
                <p><strong>GET</strong> /ride_containers</p>
                <p><strong>POST</strong> /ride_container/{'{id}'}/stop</p>
                <p><strong>POST</strong> /cleanup_containers</p>
                <p><strong>GET</strong> /queue_status</p>
                <p><strong>POST</strong> /assign_driver</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;