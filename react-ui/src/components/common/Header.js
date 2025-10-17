import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Header = ({ title, showBack = true, children }) => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {showBack && (
              <Link to="/" className="nav-link">
                <ArrowLeft size={20} />
              </Link>
            )}
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{title}</h1>
          </div>
          <div className="nav-links">
            {children}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;