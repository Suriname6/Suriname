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
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage';
import CustomerList from "./pages/Customer/CustomerList";
import CustomerExcelAdd from "./pages/Customer/CustomerExcelAdd";
import CustomerAdd from "./pages/Customer/CustomerAdd";
import CustomerDetail from "./pages/Customer/CustomerDetail";
import DashboardPage from "./pages/DashboardPage";
import PaymentListPage from "./pages/Payment/PaymentListPage";
import PaymentVirtualAccountPage from "./pages/Payment/PaymentVirtualAccountPage";
import DeliveryList from "./pages/Delivery/DeliveryList";
import DeliveryRegister from "./pages/Delivery/DeliveryRegister";
import DeliveryAnalytics from "./pages/Delivery/DeliveryAnalytics";
import SatisfactionDashboard from "./pages/Delivery/SatisfactionDashboard";
import CompletionList from "./pages/Completion/CompletionList";
import CompletionRegister from "./pages/Completion/CompletionRegister";
import DeliveryTracking from "./pages/Public/DeliveryTracking";
import SatisfactionSurvey from "./pages/Public/SatisfactionSurvey";
import RepairListPage from "./pages/Repair/RepairListPage";
import RepairWritePage from "./pages/Repair/RepairWritePage";
import RepairPresetPage from "./pages/Repair/RepairPresetPage";
import PredictionDashboard from "./pages/Prediction/PredictionDashboard";
import PredictionHistory from "./pages/Prediction/PredictionHistory";
import PredictionPerformance from "./pages/Prediction/PredictionPerformance";
import RepairTimePrediction from "./pages/Prediction/RepairTimePrediction";
import DeliveryRiskPrediction from "./pages/Prediction/DeliveryRiskPrediction";
import CustomerRetentionPrediction from "./pages/Prediction/CustomerRetentionPrediction";

function LayoutWithSidebar() {
  const location = useLocation();
  const hideSidebarPaths = ["/login", "/signup"];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

  return (
    <div className="flex">
      {!shouldHideSidebar && <SidebarNavigation />}
      <div className={`flex-1 p-6 bg-gray-100 min-h-screen`}>
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
          <Route path="/customer/upload/excel" element={<CustomerExcelAdd />} />
          <Route path="/customer/upload" element={<CustomerAdd />} />
          <Route path="/customer/detail/:id" element={<CustomerDetail />} />
          <Route path="/dashboard/statistics" element={<DashboardPage />} />
          <Route path="/payment/list" element={<PaymentListPage />} />
          <Route
            path="/payment/virtualaccount"
            element={<PaymentVirtualAccountPage />}
          />
          <Route path="/repair/list" element={<RepairListPage />} />
          <Route path="/repair/preset" element={<RepairPresetPage />} />
          <Route path="/repair/write" element={<RepairWritePage />} />
          <Route path="/delivery/list" element={<DeliveryList />} />
          <Route path="/delivery/register" element={<DeliveryRegister />} />
          <Route path="/delivery/analytics" element={<DeliveryAnalytics />} />
          <Route path="/delivery/satisfaction" element={<SatisfactionDashboard />} />
          <Route path="/completion/list" element={<CompletionList />} />
          <Route path="/completion/register" element={<CompletionRegister />} />
          {/* Prediction Analysis Routes */}
          <Route path="/predictions" element={<PredictionDashboard />} />
          <Route path="/predictions/dashboard" element={<PredictionDashboard />} />
          <Route path="/predictions/repair-time" element={<RepairTimePrediction />} />
          <Route path="/predictions/delivery-risk" element={<DeliveryRiskPrediction />} />
          <Route path="/predictions/customer-retention" element={<CustomerRetentionPrediction />} />
          <Route path="/predictions/performance" element={<PredictionPerformance />} />
          <Route path="/predictions/history" element={<PredictionHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
