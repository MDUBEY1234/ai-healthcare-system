// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './UI/ProfileDropdown';
import TextType from './UI/TextType'; // Import for animation
import './Navbar.css';

const Navbar = ({ view, setView }) => { // Accept view and setView from Dashboard
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side is empty to allow for centering */}
        <div className="nav-left"></div> 
        
        {/* Center Logo */}
        <div className="nav-center">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-logo">
            <i className="fas fa-heartbeat"></i>
            {isAuthenticated ? (
              <TextType 
                text={["Swasthya Saathi", ""]}
                typingSpeed={140}
                 // Speed of erasing characters
                pauseDuration={1500}  // How long to pause before starting to erase
                loop={true}   
                className="logo-text"
              />
            ) : (
              <span className="logo-text">Swasthya Saathi</span>
            )}
          </Link>
        </div>
        
        {/* Right side with buttons */}
        <div className="nav-right">
          {isAuthenticated && user ? (
            <>
              <button 
                className="ai-chat-button"
                onClick={() => setView(view === 'chat' ? 'main' : 'chat')}
              >
                <i className="fas fa-robot"></i>
                <span className="button-text">AI Assistant</span>
              </button>
              <ProfileDropdown user={user} onLogout={handleLogout} />
            </>
          ) : (
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/login" className="nav-links-btn btn-primary">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-links-btn btn-primary">Sign Up</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;