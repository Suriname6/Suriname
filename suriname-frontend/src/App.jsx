import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import PaymentListPage from './pages/PaymentListPage';
import PaymentVirtualAccountPage from './pages/PaymentVirtualAccountPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/payment/list" element={<PaymentListPage />} />
        <Route path="/payment/virtualaccount" element={<PaymentVirtualAccountPage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
