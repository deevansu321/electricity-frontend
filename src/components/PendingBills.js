import React, { useEffect, useState } from 'react';
import './PendingBills.css';
import axios from 'axios';
import {
  FaUser, FaCalendarAlt, FaBolt, FaRupeeSign, FaClock, FaHourglassHalf, FaSearch
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const PendingBills = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 10;

  useEffect(() => {
    const fetchPendingBills = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/pending-bills`);
        setBills(response.data);
        setFilteredBills(response.data);
      } catch (err) {
        console.error('Error fetching pending bills:', err);
        setError('⚠️ Failed to load pending bills. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBills();
  }, []);

  useEffect(() => {
    const filtered = bills.filter(
      (bill) =>
        bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.user_id.toString().includes(searchTerm)
    );
    setFilteredBills(filtered);
    setCurrentPage(1);
  }, [searchTerm, bills]);

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const totalPages = Math.ceil(filteredBills.length / billsPerPage);
  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <motion.div
      className="pending-bills-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2><FaHourglassHalf style={{ marginRight: '10px' }} />Pending Bills</h2>

      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by User ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading pending bills...</p>
        </div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : filteredBills.length === 0 ? (
        <p className="no-bills">🎉 No pending bills found.</p>
      ) : (
        <>
          <p className="pending-count">
            Total Pending Bills: <strong>{filteredBills.length}</strong>
          </p>

          <div className="table-wrapper">
            <table className="pending-bills-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th><FaUser className="table-icon" /> User ID</th>
                  <th><FaUser className="table-icon" /> Name</th>
                  <th><FaCalendarAlt className="table-icon" /> Month</th>
                  <th><FaBolt className="table-icon" /> Units</th>
                  <th><FaRupeeSign className="table-icon" /> Amount</th>
                  <th>Status</th>
                  <th><FaClock className="table-icon" /> Created At</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.map((bill, index) => (
                  <tr key={bill.id}>
                    <td>{indexOfFirstBill + index + 1}</td>
                    <td>{bill.user_id}</td>
                    <td>{bill.name}</td>
                    <td>{bill.month}</td>
                    <td>{bill.units}</td>
                    <td>₹{Number(bill.amount).toFixed(2)}</td>
                    <td><span className="status-pending">Pending</span></td>
                    <td>{formatDateTime(bill.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PendingBills;
