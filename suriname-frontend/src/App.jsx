import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SidebarNavigation from './components/SidebarNavigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

function LayoutWithSidebar({ children }) {
  const location = useLocation();
  const hideSidebarPaths = ['/login', '/signup'];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <div className="flex">
      {!shouldHideSidebar && <SidebarNavigation />}
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LayoutWithSidebar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </LayoutWithSidebar>
    </Router>
  );
}

export default App;
