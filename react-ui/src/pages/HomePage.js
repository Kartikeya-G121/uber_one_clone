import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, Settings, Zap } from 'lucide-react';

const HomePage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255,0,0,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255,255,0,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      
      <div className="container" style={{ textAlign: 'center', maxWidth: '700px', position: 'relative', zIndex: 1 }}>
        {/* Emergency Feature Highlight Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
          padding: '0.75rem 1.5rem',
          borderRadius: '50px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px rgba(255,0,0,0.4)',
          animation: 'glow 2s ease-in-out infinite'
        }}>
          <Zap size={20} fill="yellow" color="yellow" />
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
            NEW: Emergency Rides - Guaranteed in 5 Minutes
          </span>
          <Zap size={20} fill="yellow" color="yellow" />
        </div>

        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🚗</div>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '0.5rem', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Uber Quick
        </h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '2rem', opacity: 0.9, color: '#ffd700' }}>
          Priority rides when every second counts
        </p>
        
        {/* Feature highlights */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          marginBottom: '2.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="#ffd700" />
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>5-Min Guarantee</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="#ffd700" />
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Priority Queue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="#ffd700" />
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>24/7 Availability</span>
          </div>
        </div>
        
        <div className="grid grid-2" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <Link 
            to="/rider" 
            style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              textDecoration: 'none',
              color: 'black',
              transition: 'all 0.3s',
              cursor: 'pointer',
              border: '3px solid transparent',
              boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.border = '3px solid #ff0000';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.border = '3px solid transparent';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,255,255,0.1)';
            }}
          >
            <Users size={48} style={{ marginBottom: '1rem', color: '#ff0000' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>I am a Rider</h3>
            <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>Request emergency or regular rides</p>
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.5rem', 
              background: '#fff3cd', 
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#856404'
            }}>
              Try Emergency Mode!
            </div>
          </Link>
          
          <Link 
            to="/driver" 
            style={{ 
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              textDecoration: 'none',
              color: 'black',
              transition: 'all 0.3s',
              cursor: 'pointer',
              border: '3px solid transparent',
              boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.border = '3px solid #28a745';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(40,167,69,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.border = '3px solid transparent';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,255,255,0.1)';
            }}
          >
            <Car size={48} style={{ marginBottom: '1rem', color: '#28a745' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '600' }}>I am a Driver</h3>
            <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>Accept rides and earn more</p>
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.5rem', 
              background: '#d4edda', 
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#155724'
            }}>
              Bonus for Emergency Rides
            </div>
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
            transition: 'all 0.3s',
            border: '2px solid rgba(255,255,255,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.border = '2px solid rgba(255,255,255,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.border = '2px solid rgba(255,255,255,0.2)';
          }}
        >
          <Settings size={20} />
          Admin Panel
        </Link>

        {/* Footer tagline */}
        <p style={{ 
          marginTop: '3rem', 
          fontSize: '0.9rem', 
          opacity: 0.6,
          fontStyle: 'italic'
        }}>
          "Because emergencies can't wait"
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(255,0,0,0.4); }
          50% { box-shadow: 0 4px 30px rgba(255,0,0,0.7); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
