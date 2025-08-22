import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';
import './Auth.css';
import { FaMobileAlt, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';



const LoginForm = () => {
  const [form, setForm] = useState({
    mobile: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      const user = res.data.user;

      localStorage.setItem('user', JSON.stringify(user));

      alert('Login Success ✅');

      if (user.role === 'admin' || user.isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed ❌');
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <h2 className="login-title">🔐 Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FaMobileAlt className="input-icon" />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
          <p className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;
