import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBolt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const admin = JSON.parse(localStorage.getItem('admin'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FaBolt className="logo-icon" />
        <h3>Electricity Portal</h3>
      </div>

      <div className="navbar-links">
        {!user && !admin ? (
          <>
            <Link to="/login" className="nav-link">
              <FaSignInAlt className="icon" /> Login
            </Link>
            <Link to="/register" className="nav-link">
              <FaUserPlus className="icon" /> Register
            </Link>
          </>
        ) : (
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
