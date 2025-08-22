import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaUserCog,
  FaClock,
  FaMoneyCheckAlt,
  FaPaperPlane,
  FaPlusCircle,
  FaIdBadge,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaBolt,
  FaTimes
} from 'react-icons/fa';

import AddUserModal from './AddUserModal';

// ✅ Use environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AdminDashboard = () => {
  const [usersWithBills, setUsersWithBills] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [assigningUserId, setAssigningUserId] = useState(null);
  const [billForm, setBillForm] = useState({
    month: '',
    previousReading: '',
    currentReading: '',
    units: '',
    amount: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const ratePerUnit = 7;
  const admin = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchUsersWithBills();
  }, []);

  // ✅ Fetch users
  const fetchUsersWithBills = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsersWithBills(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error('Error fetching users with bills:', err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = usersWithBills.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.mobile?.includes(query) ||
        String(user.user_id).includes(query)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleBillInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...billForm, [name]: value };

    const prev = parseInt(updatedForm.previousReading);
    const curr = parseInt(updatedForm.currentReading);

    if (!isNaN(prev) && !isNaN(curr) && curr >= prev) {
      const units = curr - prev;
      const amount = units * ratePerUnit;
      updatedForm.units = units;
      updatedForm.amount = amount;
    } else {
      updatedForm.units = '';
      updatedForm.amount = '';
    }

    setBillForm(updatedForm);
  };

  // ✅ Assign bill
  const handleAssignBill = async (userId) => {
    const { month, units, amount } = billForm;
    if (!month || !units || !amount) {
      alert('❌ Please fill all bill fields correctly');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/assign-bills`, {
        user_id: userId,
        month,
        units,
        amount,
      });
      alert('✅ Bill assigned successfully!');
      setBillForm({ month: '', previousReading: '', currentReading: '', units: '', amount: '' });
      setAssigningUserId(null);
      fetchUsersWithBills();
    } catch (err) {
      alert('❌ Error assigning bill');
      console.error(err);
    }
  };

  // ✅ Send reminder
  const handleSendMessage = async (user) => {
    const { user_id, name, mobile, bill_month, amount } = user;

    if (!user_id || !name || !mobile || !bill_month || !amount) {
      alert("❌ Cannot send message — missing data.");
      return;
    }

    const message = `Hello ${name}, your electricity bill for ${bill_month} is ₹${amount}. Please pay it at your earliest convenience.`;

    try {
      await axios.post(`${API_BASE_URL}/api/messages`, {
        user_id,
        name,
        mobile_number: mobile,
        month: bill_month,
        amount,
        message,
      });
      alert("📩 Reminder sent successfully!");
    } catch (error) {
      alert("❌ Failed to send message");
      console.error(error);
    }
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredUsers.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div>
          <h2><FaUser style={{ marginRight: '8px' }} /> Admin Dashboard</h2>
          <p>Welcome back, <strong>{admin?.name || 'Admin'}</strong></p>
        </div>
        <Link to="/admin-profile" className="top-left-profile-btn">
          <FaUserCog style={{ marginRight: '6px' }} />
          Manage Profile
        </Link>
        <a href="/support" className="top-left-profile-btn11">
          💬 Support Panel
        </a>
      </header>

      {/* Dashboard Cards */}
      <section className="admin-cards">
        <div className="admin-card total">
          <h3><FaUser /> Total Users</h3>
          <p>{new Set(usersWithBills.map(u => u.user_id)).size}</p>
          <button className="add-user-btn" onClick={() => setShowAddUserModal(true)}>
            <FaPlusCircle style={{ marginRight: '6px' }} />
            Add User
          </button>
        </div>

        <div className="admin-card pending">
          <h3><FaClock /> Pending Bills</h3>
          <p>{usersWithBills.filter(u => u.bill_month && u.payment_status?.toLowerCase() !== 'paid').length}</p>
          <Link to="/pending-bills" className="view-more">View All</Link>
        </div>

        <div className="admin-card paid">
          <h3><FaMoneyCheckAlt /> Paid Bills</h3>
          <p>{usersWithBills.filter(u => u.payment_status?.toLowerCase() === 'paid').length}</p>
          <Link to="/bill-payments" className="view-more">View All</Link>
        </div>
      </section>

      {/* Search Bar */}
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Search by Name, Mobile or ID..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* User Table */}
      <section className="admin-actions">
        <h3><FaBolt style={{ marginRight: '6px' }} /> Users & Bills</h3>
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Month</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((user, index) => (
                <tr key={index} className="fade-in">
                  <td>{user.user_id}</td>
                  <td>
                    <span className="clickable-name" onClick={() => setSelectedUser(user)}>
                      {user.name}
                    </span>
                  </td>
                  <td>{user.mobile}</td>
                  <td>{user.bill_month || '—'}</td>
                  <td>{user.units ?? '—'}</td>
                  <td>{user.amount ? `₹${user.amount}` : '—'}</td>
                  <td>
                    {user.payment_status === 'Paid' ? (
                      <span className="status paid"><FaCheckCircle /> Paid</span>
                    ) : user.payment_status === 'Unpaid' ? (
                      <span className="status unpaid"><FaTimesCircle /> Unpaid</span>
                    ) : '—'}
                  </td>
                  <td>
                    {assigningUserId === user.user_id ? (
                      <div className="assign-bill-form">
                        <input
                          type="text"
                          name="month"
                          placeholder="Month (e.g. July)"
                          value={billForm.month}
                          onChange={handleBillInputChange}
                        />
                        <input
                          type="number"
                          name="previousReading"
                          placeholder="Previous Reading"
                          value={billForm.previousReading}
                          onChange={handleBillInputChange}
                        />
                        <input
                          type="number"
                          name="currentReading"
                          placeholder="Current Reading"
                          value={billForm.currentReading}
                          onChange={handleBillInputChange}
                        />
                        <input
                          type="number"
                          name="units"
                          placeholder="Units"
                          value={billForm.units}
                          readOnly
                        />
                        <input
                          type="number"
                          name="amount"
                          placeholder="Amount"
                          value={billForm.amount}
                          readOnly
                        />
                        <button onClick={() => handleAssignBill(user.user_id)}>
                          <FaCheckCircle style={{ marginRight: '5px' }} /> Submit
                        </button>
                      </div>
                    ) : (
                      <button className="action-btn" onClick={() => setAssigningUserId(user.user_id)}>
                        <FaPlusCircle style={{ marginRight: '5px' }} /> Assign Bill
                      </button>
                    )}
                    {user.bill_month && user.payment_status === 'Unpaid' && (
                      <button className="send-msg-btn" onClick={() => handleSendMessage(user)}>
                        <FaPaperPlane style={{ marginRight: '5px' }} /> Send Reminder
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            ◀ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            Next ▶
          </button>
        </div>
      </section>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} onUserAdded={fetchUsersWithBills} />
      )}

      {/* User Info Modal */}
      {selectedUser && (
        <div className="modal-backdrop">
          <div className="modal user-view-modal">
            <button className="close-btn" onClick={() => setSelectedUser(null)}>
              <FaTimes />
            </button>
            <h3>👤 User Details</h3>
            <p><FaIdBadge /> <strong>ID:</strong> {selectedUser.user_id}</p>
            <p><FaUser /> <strong>Name:</strong> {selectedUser.name}</p>
            <p><FaPhoneAlt /> <strong>Mobile:</strong> {selectedUser.mobile}</p>
            <p><FaMapMarkerAlt /> <strong>Address:</strong> {selectedUser.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
