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
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import ReceiptMain from "./pages/Main/ReceiptMain";
import RepaitMain from "./pages/Main/RepariMain";

import CustomerList from "./pages/Customer/CustomerList";
import CustomerExcelAdd from "./pages/Customer/CustomerExcelAdd";
import CustomerAdd from "./pages/Customer/CustomerAdd";
import CustomerDetail from "./pages/Customer/CustomerDetail";

import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import EmployeePerformancePage from "./pages/Dashboard/EmployeePerformancePage.jsx";

import ProductList from "./pages/Product/ProductList";
import ProductAdd from "./pages/Product/ProductAdd";
import ProductExcelAdd from "./pages/Product/ProductExcelAdd";
import ProductDetail from "./pages/Product/ProductDetail";

import PaymentListPage from "./pages/Payment/PaymentListPage";
import PaymentVirtualAccountPage from "./pages/Payment/PaymentVirtualAccountPage";

import StaffListPage from "./pages/staff/StaffListPage";
import StaffRequestPage from "./pages/staff/StaffRequestPage";
import StaffApprovalPage from "./pages/staff/StaffApprovalPage";
import StaffDetailPage from "./pages/staff/StaffDetailPage";

import DeliveryList from "./pages/Delivery/DeliveryList";
import DeliveryRegister from "./pages/Delivery/DeliveryRegister";
import DeliveryAnalytics from "./pages/Delivery/DeliveryAnalytics";

import CompletionList from "./pages/Completion/CompletionList";
import CompletionRegister from "./pages/Completion/CompletionRegister";
import DeliveryTracking from "./pages/Public/DeliveryTracking";
import SatisfactionSurvey from "./pages/Public/SatisfactionSurvey";

import RepairListPage from "./pages/Repair/RepairListPage";
import RepairWritePage from "./pages/Repair/RepairWritePage";
import RepairPresetPage from "./pages/Repair/RepairPresetPage";

import RequestList from "./pages/Request/RequestList.jsx"
import RequestDetail from "./pages/Request/RequestDetail.jsx"
import RequestForm from "./pages/Request/RequestForm.jsx"
import RequestEdit from "./pages/Request/RequestEdit.jsx"

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* 공개 페이지 (고객용) */}
        <Route path="/tracking" element={<DeliveryTracking />} />
        <Route path="/survey/:completionId" element={<SatisfactionSurvey />} />

        {/* 사이드바 포함 페이지 */}
        <Route element={<LayoutWithSidebar />}>
          <Route path="/" element={<Home />} />

          <Route path="/customer/list" element={<CustomerList />} />
          <Route
            path="/customer/register/excel"
            element={<CustomerExcelAdd />}
          />
          <Route path="/customer/register" element={<CustomerAdd />} />
          <Route path="/customer/detail/:id" element={<CustomerDetail />} />
          <Route path="/dashboard/statistics" element={<DashboardPage />} />
          <Route path="/dashboard/performance" element={<EmployeePerformancePage />} />

          <Route path="/payment/list" element={<PaymentListPage />} />
          <Route
            path="/payment/virtualaccount"
            element={<PaymentVirtualAccountPage />}
          />
          <Route path="/product/list" element={<ProductList />} />
          <Route path="/product/register" element={<ProductAdd />} />
          <Route path="/product/register/excel" element={<ProductExcelAdd />} />
          <Route path="/product/detail/:id" element={<ProductDetail />} />

          <Route path="/staff/list" element={<StaffListPage />} />
          <Route path="/staff/requests" element={<StaffRequestPage />} />
          <Route
            path="/staff/approval/:employeeId"
            element={<StaffApprovalPage />}
          />
          <Route
            path="/staff/detail/:employeeId"
            element={<StaffDetailPage />}
          />
          <Route path="/repair/list" element={<RepairListPage />} />
          <Route path="/repair/preset" element={<RepairPresetPage />} />
          <Route path="/repair/write" element={<RepairWritePage />} />
          <Route path="/delivery/list" element={<DeliveryList />} />
          <Route path="/delivery/register" element={<DeliveryRegister />} />
          <Route path="/delivery/analytics" element={<DeliveryAnalytics />} />
          <Route path="/completion/list" element={<CompletionList />} />
          <Route path="/completion/register" element={<CompletionRegister />} />

          <Route path="/request/list" element={<RequestList />} />
          <Route path="/request/register" element={<RequestForm />} />
          <Route path="/request/:id" element={<RequestDetail />} />
          <Route path="/request/edit/:id" element={<RequestEdit />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
