import React, { useState } from 'react';
import { registerUser } from '../api';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaMobileAlt,
  FaLock,
  FaMapMarkerAlt,
  FaUserShield,
  FaTimes,
} from 'react-icons/fa';
import './AddUserModal.css';

const AddUserModal = ({ onClose, onUserAdded }) => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    password: '',
    address: '',
    role: 'user',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      if (res?.data?.message) {
        alert(res.data.message);
        onUserAdded?.();
        onClose?.();
      } else {
        throw new Error('No message from server');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'User creation failed ❌';
      alert(msg);
    }
  };

  return (
    <div className="modal-backdrop">
      <motion.div
        className="modal"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>👤Add New User</h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              value={form.name}
            />
          </div>

          <div className="input-group">
            <FaMobileAlt className="input-icon" />
            <input
              name="mobile"
              placeholder="Mobile Number"
              onChange={handleChange}
              required
              value={form.mobile}
              pattern="[0-9]{10}"
              title="Enter a valid 10-digit mobile number"
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
              value={form.password}
              minLength={6}
            />
          </div>

          <div className="input-group">
            <FaMapMarkerAlt className="input-icon" />
            <input
              name="address"
              placeholder="Address"
              onChange={handleChange}
              required
              value={form.address}
            />
          </div>

          <div className="input-group select-group">
  <FaUserShield className="input-icon" />
  <select
    name="role"
    onChange={handleChange}
    value={form.role}
    required
  >
    <option value="user">User</option>
    {/* Extend with more roles */}
  </select>
</div>


          <button type="submit" className="btn-primary">
            Add User
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddUserModal;
