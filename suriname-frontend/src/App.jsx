import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from 'react-router-dom';
import SidebarNavigation from './components/SidebarNavigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerList from './pages/Customer/CustomerList';

function LayoutWithSidebar() {
  const location = useLocation();
  const hideSidebarPaths = ['/login', '/signup'];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <div className="flex">
      {!shouldHideSidebar && <SidebarNavigation />}
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<LayoutWithSidebar />}>
          <Route path="/" element={<Home />} />
          <Route path="/customer/list" element={<CustomerList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
