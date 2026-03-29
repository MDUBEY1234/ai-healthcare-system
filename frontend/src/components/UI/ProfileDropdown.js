// src/components/UI/ProfileDropdown.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from 'react-avatar';
import './ProfileDropdown.css';

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate(); // Get the navigate function

  useEffect(() => { /* ... (this useEffect remains the same) ... */
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDashboardClick = () => {
    setIsOpen(false);
    // Navigate to the dashboard and pass a 'state' object.
    // This tells the DashboardPage to reset itself.
    navigate('/dashboard', { state:  { resetView: true } }); 
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
        {/* ... avatar and user name ... */}
        <Avatar name={user.name} size="40" round={true} src={user.profilePicture} />
        <span className="user-name">{user.name}</span>
        <i className={`fas fa-chevron-down chevron-icon ${isOpen ? 'open' : ''}`}></i>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div /* ... */ className="dropdown-menu">
            {/* THIS IS NOW A BUTTON */}
            <button onClick={handleDashboardClick} className="dropdown-item">
              <i className="fas fa-th-large"></i> Dashboard
            </button>
            
            {/* ... commented out settings link ... */}
            
            <div className="dropdown-divider"></div>
            <button onClick={onLogout} className="dropdown-item logout">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;