import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, Settings } from 'lucide-react';

const HomePage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚗</div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: '700' }}>
          Uber Clone
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.9 }}>
          Choose your role to get started
        </p>
        
        <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
          <Link 
            to="/rider" 
            className="card"
            style={{ 
              textDecoration: 'none',
              color: 'black',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Users size={48} style={{ marginBottom: '1rem', color: '#000' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>I'm a Rider</h3>
            <p style={{ opacity: 0.7 }}>Request rides and get to your destination</p>
          </Link>
          
          <Link 
            to="/driver" 
            className="card"
            style={{ 
              textDecoration: 'none',
              color: 'black',
              transition: 'transform 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Car size={48} style={{ marginBottom: '1rem', color: '#000' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>I'm a Driver</h3>
            <p style={{ opacity: 0.7 }}>Register as a driver and accept ride requests</p>
          </Link>
        </div>
        
        <Link 
          to="/admin" 
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '25px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
        >
          <Settings size={20} />
          Admin Panel
        </Link>
      </div>
    </div>
  );
};

export default HomePage;