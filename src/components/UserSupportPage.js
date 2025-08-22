import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserSupportPage.css';
import { motion } from 'framer-motion';
import { FaUserCircle, FaRobot, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const UserSupportPage = () => {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.id) {
      axios.get(`${API_BASE_URL}/api/support/${user.id}`)
        .then(res => {
          if (res.data.success) {
            setMessages(res.data.messages);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleReply = async (e) => {
    e.preventDefault();
    const payload = {
      user_id: user.id,
      sender: 'user',
      name: user.name,
      mobile: user.mobile,
      message: reply
    };

    try {
      await axios.post(`${API_BASE_URL}/api/support`, payload);
      setReply('');
      setStatus('✅ Message sent');

      const res = await axios.get(`${API_BASE_URL}/api/support/${user.id}`);
      setMessages(res.data.messages);
    } catch (error) {
      setStatus('❌ Failed to send message');
    }
  };

  return (
    <motion.div
      className="support-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h2
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        📞 Support & Contact Us
      </motion.h2>

      <p className="support-intro">
        Need help with something? Our support team is here to assist you. Send us a message below or reach out using the contact details.
      </p>

      <div className="contact-info-box">
        <div className="contact-item"><FaPhoneAlt /> <strong>Phone:</strong> +91 98765 43210</div>
        <div className="contact-item"><FaEnvelope /> <strong>Email:</strong> support@megacart.com</div>
        <div className="contact-item"><FaMapMarkerAlt /> <strong>Address:</strong> 123 MegaCart St, Tech City, India</div>
      </div>

      <h3 className="conversation-heading">🗨️ Your Conversation</h3>

      <div className="modern-chat-box">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`modern-chat-message ${msg.sender === 'admin' ? 'admin-msg' : 'user-msg'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="msg-header">
              {msg.sender === 'admin' ? <FaRobot /> : <FaUserCircle />}
              <strong>{msg.sender === 'admin' ? 'Admin' : 'You'}</strong>
            </div>
            <div className="msg-body">{msg.message}</div>
            <div className="msg-footer">{new Date(msg.sent_at).toLocaleString()}</div>
          </motion.div>
        ))}
      </div>

      <form className="modern-support-form" onSubmit={handleReply}>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your message..."
          required
        />
        <button type="submit">📨 Send</button>
      </form>

      {status && <p className="status-msg">{status}</p>}
    </motion.div>
  );
};

export default UserSupportPage;
