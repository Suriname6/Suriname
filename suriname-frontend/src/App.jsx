import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import SidebarNavigation from "./components/SidebarNavigation";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CustomerList from "./pages/Customer/CustomerList";
import CustomerExcelAdd from "./pages/Customer/CustomerExcelAdd";
import CustomerAdd from "./pages/Customer/CustomerAdd";
import CustomerDetail from "./pages/Customer/CustomerDetail";
import DashboardPage from "./pages/DashboardPage";
import PaymentListPage from "./pages/Payment/PaymentListPage";
import PaymentVirtualAccountPage from "./pages/Payment/PaymentVirtualAccountPage";

function LayoutWithSidebar() {
  const location = useLocation();
  const hideSidebarPaths = ["/login", "/signup"];
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
        {/* 사이드바 숨김 페이지 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 사이드바 포함 페이지 */}
        <Route element={<LayoutWithSidebar />}>
          <Route path="/" element={<Home />} />
          <Route path="/customer/list" element={<CustomerList />} />
          <Route path="/customer/upload/excel" element={<CustomerExcelAdd />} />
          <Route path="/customer/upload" element={<CustomerAdd />} />
          <Route path="/customer/detail/:id" element={<CustomerDetail />} />
          <Route path="/dashboard/statistics" element={<DashboardPage />} />
          <Route path="/payment/list" element={<PaymentListPage />} />
          <Route
            path="/payment/virtualaccount"
            element={<PaymentVirtualAccountPage />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
