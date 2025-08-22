import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import PendingBills from './components/PendingBills'; // ✅ import this
import BillPaymentPage from './components/BillPaymentPage';
import AddUserModal from './components/AddUserModal';
import AdminProfilePage from './components/AdminProfilePage';
import UserProfileModal from './components/UserProfileModal';
import SupportPage from './components/SupportPage'; // Import SupportPage
import UserSupportPage from './components/UserSupportPage';




function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/pending-bills" element={<PendingBills />} /> {/* ✅ */}
          <Route path="/bill-payments" element={<BillPaymentPage />} />
          <Route path="/add-user" element={<AddUserModal />} />
          <Route path="/admin-profile" element={<AdminProfilePage />} />
          <Route path="/user-profile" element={<UserProfileModal />} />
          <Route path="/support" element={<SupportPage />} /> {/* Add SupportPage route */}
          <Route path="/user-support" element={<UserSupportPage/ >} />



      </Routes>
    </Router>
  );
}

export default App;
