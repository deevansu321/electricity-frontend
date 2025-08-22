import React, { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaMobileAlt,
  FaLock,
  FaMapMarkerAlt,
  FaUserShield,
  FaSignInAlt,
} from 'react-icons/fa';
import './Auth2.css';

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    password: '',
    address: '',
    role: 'user',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      alert(res.data.message);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed ❌');
    }
  };

  return (
    <div className="auth-container">
      <motion.form
        className="auth-form"
        onSubmit={handleSubmit}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Register</h2>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input name="name" placeholder="Full Name" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FaMobileAlt className="input-icon" />
          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FaMapMarkerAlt className="input-icon" />
          <input name="address" placeholder="Address" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <FaUserShield className="input-icon" />
          <select name="role" onChange={handleChange} required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="btn-primary12">Register</button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/login')}
        >
          <FaSignInAlt style={{ marginRight: '6px' }} />
          Login Instead
        </button>
      </motion.form>
    </div>
  );
};

export default RegisterForm;
