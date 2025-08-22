import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SupportPage.css';
import { motion } from 'framer-motion';
import { FaUserCircle, FaRobot } from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const AdminSupportPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const admin = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/support`)
      .then(res => {
        if (res.data.success) {
          setUsers(res.data.users);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      axios.get(`${API_BASE_URL}/api/support/${selectedUserId}`)
        .then(res => {
          if (res.data.success) {
            setMessages(res.data.messages);
          }
        })
        .catch(console.error);
    }
  }, [selectedUserId]);

  const handleReply = async e => {
    e.preventDefault();
    const payload = {
      user_id: selectedUserId,
      sender: 'admin',
      name: 'Admin',
      mobile: admin.mobile,
      message: reply
    };
    try {
      await axios.post(`${API_BASE_URL}/api/support`, payload);
      setReply('');
      setStatus('✅ Reply sent');
      const res = await axios.get(`${API_BASE_URL}/api/support/${selectedUserId}`);
      setMessages(res.data.messages);
    } catch {
      setStatus('❌ Failed to send reply');
    }
  };

  return (
    <motion.div className="admin-support-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.h2 initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }} className="page-title">
        🛠️ Admin Support Panel
      </motion.h2>

      <div className="user-selection-section">
        <h3>👥 Select a User</h3>
        <div className="user-card-list">
          {users.map(user => (
            <motion.div
              key={user.user_id}
              onClick={() => setSelectedUserId(user.user_id)}
              className={`user-card ${selectedUserId === user.user_id ? 'selected' : ''}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaUserCircle className="user-icon" />
              <div className="user-info">
                <strong>{user.name}</strong>
                <p>{user.mobile}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedUserId && (
        <motion.div
          className="chat-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="chat-box">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                className={`chat-card ${msg.sender === 'admin' ? 'admin-msg' : 'user-msg'}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="msg-header">
                  {msg.sender === 'admin' ? <FaRobot /> : <FaUserCircle />}
                  <span className="sender-name">{msg.sender === 'admin' ? 'Admin' : msg.name}</span>
                </div>
                <div className="msg-content">{msg.message}</div>
                <div className="msg-time">{new Date(msg.sent_at).toLocaleString()}</div>
              </motion.div>
            ))}
          </div>

          <form className="reply-form" onSubmit={handleReply}>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Type your reply here..."
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="send-btn"
            >
              📤 Send Reply
            </motion.button>
          </form>

          {status && <p className="status-text">{status}</p>}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminSupportPage;
