import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardPage from './pages/DashboardPage';
import PaymentListPage from './pages/PaymentListPage';
import PaymentVirtualAccountPage from './pages/PaymentVirtualAccountPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/payment/list" element={<PaymentListPage />} />
        <Route path="/payment/virtualaccount" element={<PaymentVirtualAccountPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
