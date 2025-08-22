import React, { useState, useEffect } from 'react';
import './AdminProfilePage.css';
import { FaUser, FaPhoneAlt, FaLock, FaSave, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const AdminProfilePage = () => {
  const adminFromStorage = JSON.parse(localStorage.getItem('user'));
  const adminId = adminFromStorage?.id;

  const [admin, setAdmin] = useState({
    name: '',
    mobile: '',
    address: '',
    password: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/${adminId}`);
        setAdmin({
          name: response.data.name,
          mobile: response.data.mobile,
          address: response.data.address || '',
          password: ''
        });
      } catch (err) {
        setError('Failed to load admin profile.');
      }
    };

    if (adminId) {
      fetchAdmin();
    }
  }, [adminId]);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const updateData = {
        name: admin.name,
        mobile: admin.mobile,
        address: admin.address,
        password: admin.password.trim() === '' ? undefined : admin.password
      };

      await axios.put(`${API_BASE_URL}/api/admin/${adminId}`, updateData);
      setSuccess('✅ Profile updated successfully');
      setAdmin({ ...admin, password: '' });
    } catch (err) {
      setError('❌ Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="admin-profile-container">
      <h2><FaUser style={{ marginRight: '10px' }} /> Admin Profile</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        <label><FaUser /> Name</label>
        <input
          type="text"
          name="name"
          value={admin.name}
          onChange={handleChange}
          required
        />

        <label><FaPhoneAlt /> Phone</label>
        <input
          type="text"
          name="mobile"
          value={admin.mobile}
          onChange={handleChange}
          required
        />

        <label><FaMapMarkerAlt /> Address</label>
        <input
          type="text"
          name="address"
          value={admin.address}
          onChange={handleChange}
          required
        />

        <label><FaLock /> New Password</label>
        <input
          type="password"
          name="password"
          value={admin.password}
          onChange={handleChange}
          placeholder="Leave blank to keep unchanged"
        />

        <button type="submit" className="save-btn">
          <FaSave /> Save Changes
        </button>

        {success && <p className="success-msg">{success}</p>}
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
};

export default AdminProfilePage;
