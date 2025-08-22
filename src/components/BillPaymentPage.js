import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BillPaymentPage.css';
import { motion } from 'framer-motion';
import {
  FaUser, FaMoneyBillWave, FaCheckCircle, FaReceipt, FaRegClock,
  FaFileSignature, FaCalendarAlt, FaListOl, FaTimesCircle, FaSearch
} from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export default function BillPaymentPage() {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({ name: '', user_id: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPayments = () => {
    axios.get(`${API_BASE_URL}/api/bill-payments`, {
      params: { ...filters, page }
    })
      .then(res => {
        setPayments(res.data?.data || []);
        setTotal(res.data?.total || 0);
      })
      .catch(err => console.error('Error fetching payments', err));
  };

  useEffect(() => {
    fetchPayments();
  }, [filters, page]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // reset page on filter
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <motion.div className="bill-payment-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h2><FaMoneyBillWave style={{ marginRight: '8px' }} />All Bill Payments</h2>

      <div className="filter-bar">
        <input type="text" name="name" placeholder="Search by Name" value={filters.name} onChange={handleChange} />
        <input type="text" name="user_id" placeholder="Search by User ID" value={filters.user_id} onChange={handleChange} />
        <button onClick={fetchPayments}><FaSearch /> Search</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th><FaListOl /></th>
              <th><FaUser /> Name</th>
              <th><FaUser /> User ID</th>
              <th><FaReceipt /> Order ID</th>
              <th><FaFileSignature /> Payment ID</th>
              <th><FaMoneyBillWave /> Amount</th>
              <th><FaCheckCircle /> Status</th>
              <th><FaReceipt /> Receipt</th>
              <th><FaCalendarAlt /> Month</th>
              <th><FaRegClock /> Created At</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((pay, index) => (
                <motion.tr key={pay.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <td>{(page - 1) * 10 + index + 1}</td>
                  <td>{pay.name}</td>
                  <td>{pay.user_id}</td>
                  <td>{pay.order_id}</td>
                  <td>{pay.payment_id}</td>
                  <td>₹{pay.amount}</td>
                  <td className={`status ${pay.status === 'paid' ? 'paid' : 'failed'}`}>
                    {pay.status === 'paid' ? (<><FaCheckCircle className="icon-success" /> Paid</>) : (<><FaTimesCircle className="icon-failed" /> Failed</>)}
                  </td>
                  <td>{pay.receipt}</td>
                  <td>{pay.month}</td>
                  <td>{new Date(pay.created_at).toLocaleString()}</td>
                </motion.tr>
              ))
            ) : (
              <tr><td colSpan="10">No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => (p < totalPages ? p + 1 : p))} disabled={page === totalPages}>Next</button>
      </div>
    </motion.div>
  );
}
