import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import { motion } from 'framer-motion';
import {
  FaUser, FaFileInvoiceDollar, FaCommentDots, FaMoneyCheckAlt, FaMobileAlt,
  FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaReceipt, FaCalendarAlt,
  FaBolt, FaRupeeSign, FaEdit,
} from 'react-icons/fa';
import UserProfileModal from '../components/UserProfileModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const UserDashboard = () => {
  const loggedUser = JSON.parse(localStorage.getItem('user'));
  const userId = loggedUser?.id;

  const [user, setUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState('profile');
  const [showModal, setShowModal] = useState(false);

  const unpaidBills = bills.filter((b) => !b.paid);

  const downloadReceipt = (bill) => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html><head><meta charset="UTF-8"><title>Payment Receipt</title>
      <style>
        body { font-family: Arial; padding: 20px; background: #f7f7f7; color: #333; }
        .receipt-container { background: #fff; border-radius: 10px; padding: 30px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #2c3e50; }
        .section { margin-top: 20px; }
        .section h3 { margin-bottom: 10px; color: #3498db; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .section p { margin: 6px 0; font-size: 15px; }
        .footer { text-align: center; margin-top: 30px; font-size: 13px; color: #888; }
      </style></head><body>
      <div class="receipt-container">
        <h1>Payment Receipt</h1>
        <div class="section">
          <h3>Bill Details</h3>
          <p><strong>Month:</strong> ${bill.month}</p>
          <p><strong>Units Consumed:</strong> ${bill.units}</p>
          <p><strong>Amount Paid:</strong> ₹${bill.amount}</p>
          <p><strong>Status:</strong> Paid</p>
        </div>
        <div class="section">
          <h3>User Details</h3>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Mobile:</strong> ${user.mobile}</p>
          <p><strong>Address:</strong> ${user.address}</p>
        </div>
        <div class="section">
          <h3>Transaction</h3>
          <p><strong>Payment Method:</strong> Razorpay</p>
          <p><strong>Date:</strong> ${new Date(bill.paid_on).toLocaleString()}</p>
        </div>
        <div class="footer">Thank you for your payment.</div>
      </div></body></html>
    `;
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${bill.month}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${API_BASE_URL}/api/user/${userId}`);
        setUser(userRes.data.user);
        setBills(userRes.data.bills || []);

        const paidRes = await axios.get(`${API_BASE_URL}/api/payment/paid-bills/${userId}`);
        setPaidBills(paidRes.data.paidBills || []);

        const msgRes = await axios.get(`${API_BASE_URL}/api/messages-get/${userId}`);
        setMessages(msgRes.data.messages || []);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const loadRazorpayScript = () => new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePay = async (bill) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) return alert('❌ Razorpay SDK load failed.');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/payment/create-order`, {
        amount: bill.amount,
        user_id: userId,
        month: bill.month,
      });

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: 'INR',
        name: 'Electricity Bill Payment',
        description: `Payment for ${bill.month}`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await axios.post(`${API_BASE_URL}/api/payment/verify-payment`, {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            alert('✅ Payment successful!');

            // Reload updated data
            const userRes = await axios.get(`${API_BASE_URL}/api/user/${userId}`);
            setBills(userRes.data.bills || []);

            const paidRes = await axios.get(`${API_BASE_URL}/api/payment/paid-bills/${userId}`);
            setPaidBills(paidRes.data.paidBills || []);

            // ✅ FIXED: correct messages endpoint
            const msgRes = await axios.get(`${API_BASE_URL}/api/messages-get/${userId}`);
            setMessages(msgRes.data.messages || []);
          } catch (err) {
            alert('❌ Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name,
          contact: user?.mobile,
        },
        theme: { color: '#3399cc' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert('❌ Failed to create payment order.');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!user) return <div className="loading">User not found</div>;

  return (
    <div className="modern-dashboard-container">
      <motion.h2 className="dashboard-title" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        Welcome, {user.name} 🙍🏻‍♂️
      </motion.h2>

      <motion.div className="card-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {[
          { id: 'profile', icon: <FaUser />, label: 'Profile Info' },
          { id: 'bills', icon: <FaFileInvoiceDollar />, label: 'Pending Bills' },
          { id: 'messages', icon: <FaCommentDots />, label: 'Messages' },
          { id: 'history', icon: <FaMoneyCheckAlt />, label: 'Payment History' },
        ].map(({ id, icon, label }) => (
          <motion.div
            key={id}
            className={`dashboard-card ${activeCard === id ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveCard(id)}
          >
            {icon}
            <span>{label}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="dashboard-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {activeCard === 'profile' && (
          <motion.div className="dashboard-section" initial={{ x: -30 }} animate={{ x: 0 }}>
  <h3>👤 Profile Information</h3>
  <p><FaUser /> <strong>Name:</strong> {user.name}</p>
  <p><FaMobileAlt /> <strong>Mobile:</strong> {user.mobile}</p>
  <p><FaMapMarkerAlt /> <strong>Address:</strong> {user.address}</p>

 <div className="button-group">
  <button className="modern-btn" onClick={() => setShowModal(true)}>
    <FaEdit /> Edit Profile
  </button>

  <a href="/user-support" className="modern-btn">
    💬 Need Help? Contact Support
  </a>
</div>

</motion.div>

        )}

        {activeCard === 'bills' && (
          <motion.div className="dashboard-section" initial={{ x: -30 }} animate={{ x: 0 }}>
            <h3>📑 Pending Bills</h3>
            {unpaidBills.length > 0 ? (
              unpaidBills.map((bill) => (
                <motion.div key={bill.id} className="bill-card" whileHover={{ scale: 1.02 }}>
                  <p><FaCalendarAlt /> Month: {bill.month}</p>
                  <p><FaBolt /> Units: {bill.units}</p>
                  <p><FaRupeeSign /> Amount: ₹{bill.amount}</p>
                  <p><FaTimesCircle color="red" /> Status: Unpaid</p>
                  <button className="pay-btn" onClick={() => handlePay(bill)}>Pay Now</button>
                </motion.div>
              ))
            ) : (
              <p>✅ All bills are paid 🎉</p>
            )}
          </motion.div>
        )}

        {activeCard === 'messages' && (
          <motion.div className="dashboard-section" initial={{ x: -30 }} animate={{ x: 0 }}>
            <h3>📩 Messages</h3>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className="message-card">
                  <p>{msg.message}</p>
                  <p><FaCalendarAlt /> {new Date(msg.sent_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p>No messages</p>
            )}
          </motion.div>
        )}

        {activeCard === 'history' && (
          <motion.div className="dashboard-section" initial={{ x: -30 }} animate={{ x: 0 }}>
            <h3>📜 Payment History</h3>
            {paidBills.length > 0 ? (
              paidBills.map((bill) => (
                <motion.div key={bill.id} className="payment-history-card" whileHover={{ scale: 1.02 }}>
                  <p><FaCheckCircle color="green" /> <strong>Paid Bill</strong></p>
                  <p><FaUser /> <strong>User:</strong> {user.name}</p>
                  <p><FaCalendarAlt /> <strong>Month:</strong> {bill.month}</p>
                  <p><FaBolt /> <strong>Units:</strong> {bill.units}</p>
                  <p><FaRupeeSign /> <strong>Amount:</strong> ₹{bill.amount}</p>
                  <p><FaCalendarAlt /> <strong>Paid On:</strong> {new Date(bill.paid_on).toLocaleString()}</p>
                  <p><FaMoneyCheckAlt /> <strong>Method:</strong> Razorpay</p>
                  <button className="pay-btn" onClick={() => downloadReceipt(bill)}>
                    <FaReceipt /> Download Receipt
                  </button>
                </motion.div>
              ))
            ) : (
              <p>No past payments</p>
            )}
          </motion.div>
        )}
      </motion.div>

      <UserProfileModal
        userId={userId}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          axios.get(`${API_BASE_URL}/api/user/${userId}`).then(res => {
            setUser(res.data.user);
          });
        }}
      />
    </div>
  );
};

export default UserDashboard;
