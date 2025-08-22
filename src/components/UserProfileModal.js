// src/components/UserProfileModal.js
import React, { useState, useEffect } from 'react';
import './UserProfileModal.css';
import axios from 'axios';
import { FaUser, FaMobileAlt, FaMapMarkerAlt, FaSave, FaTimes, FaLock } from 'react-icons/fa';



const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const UserProfileModal = ({ userId, isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', mobile: '', address: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      axios.get(`${API_BASE_URL}/api/user-profile/${userId}`)
        .then(res => {
          setFormData({ ...res.data, password: '' }); // Keep password field empty
          setLoading(false);
        })
        .catch(() => {
          setStatusMsg('❌ Failed to load user data');
          setLoading(false);
        });
    }
  }, [isOpen, userId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    axios.put(`${API_BASE_URL}/api/user-profile/${userId}`, formData)
      .then(() => {
        setStatusMsg('✅ Profile updated successfully!');
      })
      .catch(() => {
        setStatusMsg('❌ Update failed. Please try again.');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="upm-overlay">
      <div className="upm-modal">
        <button className="upm-close-btn" onClick={onClose}><FaTimes /></button>
        <h2>👤 Edit Profile</h2>

        {loading ? (
          <p className="upm-loading-msg">Loading...</p>
        ) : (
          <>
            <div className="upm-input-group">
              <FaUser className="upm-input-icon" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
              />
            </div>

            <div className="upm-input-group">
              <FaMobileAlt className="upm-input-icon" />
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile Number"
              />
            </div>

            <div className="upm-input-group">
              <FaMapMarkerAlt className="upm-input-icon" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>

            <div className="upm-input-group">
              <FaLock className="upm-input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New Password"
              />
            </div>

            <button className="upm-update-btn" onClick={handleUpdate}>
              <FaSave /> Update
            </button>

            <p className="upm-status-msg">{statusMsg}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
