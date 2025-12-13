import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, Settings, Zap, Shield, Clock, TrendingUp } from 'lucide-react';

const HomePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Animated background elements with Uber green */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(6, 193, 103, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(255, 65, 108, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 5s ease-in-out infinite',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(6, 193, 103, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 6s ease-in-out infinite',
        filter: 'blur(60px)'
      }} />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div className="container" style={{
          textAlign: 'center',
          maxWidth: '1000px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Emergency Feature Highlight Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            padding: '0.875rem 2rem',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 30px rgba(255, 65, 108, 0.5)',
            animation: 'glow 2s ease-in-out infinite',
            border: '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <Zap size={22} fill="#FFD700" color="#FFD700" />
            <span style={{ fontWeight: '700', fontSize: '1rem', letterSpacing: '0.5px' }}>
              NEW: Emergency Rides - Guaranteed in 5 Minutes! 🚨
            </span>
            <Zap size={22} fill="#FFD700" color="#FFD700" />
          </div>

          {/* Main Heading */}
          <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 20px rgba(6, 193, 103, 0.3))' }}>🚗</div>
          <h1 style={{
            fontSize: '4.5rem',
            marginBottom: '1rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #06C167 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Uber Clone
          </h1>
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '3rem',
            opacity: 0.9,
            color: '#06C167',
            fontWeight: '600',
            maxWidth: '600px',
            margin: '0 auto 3rem'
          }}>
            Container-powered rides when every second counts
          </p>

          {/* Feature highlights with icons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2.5rem',
            marginBottom: '3.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'rgba(6, 193, 103, 0.1)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(6, 193, 103, 0.2)',
              minWidth: '140px'
            }}>
              <Clock size={24} color="#06C167" strokeWidth={2.5} />
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>5-Min Guarantee</span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'rgba(6, 193, 103, 0.1)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(6, 193, 103, 0.2)',
              minWidth: '140px'
            }}>
              <Zap size={24} color="#06C167" strokeWidth={2.5} />
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Priority Queue</span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
              background: 'rgba(6, 193, 103, 0.1)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(6, 193, 103, 0.2)',
              minWidth: '140px'
            }}>
              <Shield size={24} color="#06C167" strokeWidth={2.5} />
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>24/7 Available</span>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
            maxWidth: '800px',
            margin: '0 auto 2.5rem'
          }}>
            {/* Rider Card */}
            <Link
              to="/rider"
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                padding: '2.5rem 2rem',
                borderRadius: 'var(--radius-xl)',
                textDecoration: 'none',
                color: 'black',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.border = '2px solid #06C167';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(6, 193, 103, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(6, 193, 103, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              <Users size={56} style={{ marginBottom: '1.25rem', color: '#06C167' }} strokeWidth={1.5} />
              <h3 style={{
                fontSize: '1.75rem',
                marginBottom: '0.75rem',
                fontWeight: '700',
                color: '#000000'
              }}>I'm a Rider</h3>
              <p style={{
                opacity: 0.7,
                fontSize: '1rem',
                marginBottom: '1.25rem',
                lineHeight: '1.6'
              }}>
                Request emergency or regular rides with container isolation
              </p>
              <div style={{
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #06C167 0%, #04A456 100%)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 4px 15px rgba(6, 193, 103, 0.3)'
              }}>
                ⚡ Try Emergency Mode!
              </div>
            </Link>

            {/* Driver Card */}
            <Link
              to="/driver"
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                padding: '2.5rem 2rem',
                borderRadius: 'var(--radius-xl)',
                textDecoration: 'none',
                color: 'black',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.border = '2px solid #1FB6FF';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(31, 182, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(31, 182, 255, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              <Car size={56} style={{ marginBottom: '1.25rem', color: '#1FB6FF' }} strokeWidth={1.5} />
              <h3 style={{
                fontSize: '1.75rem',
                marginBottom: '0.75rem',
                fontWeight: '700',
                color: '#000000'
              }}>I'm a Driver</h3>
              <p style={{
                opacity: 0.7,
                fontSize: '1rem',
                marginBottom: '1.25rem',
                lineHeight: '1.6'
              }}>
                Accept rides and maximize your earnings with priority system
              </p>
              <div style={{
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #1FB6FF 0%, #0E9AFF 100%)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 4px 15px rgba(31, 182, 255, 0.3)'
              }}>
                💰 Earn Bonus on Emergency Rides
              </div>
            </Link>
          </div>

          {/* Admin Panel Link */}
          <Link
            to="/admin"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: '1rem 2.5rem',
              borderRadius: 'var(--radius-full)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.border = '2px solid rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
            }}
          >
            <Settings size={22} strokeWidth={2} />
            Admin Dashboard
          </Link>

          {/* Stats Section */}
          <div style={{
            marginTop: '4rem',
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#06C167',
                marginBottom: '0.5rem'
              }}>5min</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Emergency Guarantee</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#06C167',
                marginBottom: '0.5rem'
              }}>24/7</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Always Available</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#06C167',
                marginBottom: '0.5rem'
              }}>🐳</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Container Isolation</div>
            </div>
          </div>

          {/* Footer tagline */}
          <p style={{
            marginTop: '3.5rem',
            fontSize: '1rem',
            opacity: 0.5,
            fontStyle: 'italic',
            fontWeight: '300'
          }}>
            "Powered by Docker containers - Because emergencies can't wait"
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 8px 30px rgba(255, 65, 108, 0.5); }
          50% { box-shadow: 0 8px 40px rgba(255, 65, 108, 0.8); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
