import { getUserRole } from "../../utils/auth.js";
import AdminDashboard from "../../components/dashboard/AdminDashboard.jsx";
import StaffDashboard from "../../components/dashboard/StaffDashboard.jsx";
import EngineerDashboard from "../../components/dashboard/EngineerDashboard.jsx";
import SidebarNavigation from "../../components/SidebarNavigation.jsx";
import "../../css/Dashboard.css";

export default function DashboardPage() {
  const role = getUserRole();

  let DashboardComponent;
  if (role === "ADMIN") DashboardComponent = AdminDashboard;
  else if (role === "STAFF") DashboardComponent = StaffDashboard;
  else if (role === "ENGINEER") DashboardComponent = EngineerDashboard;

  return (
    <div className="dashboard-container">
      <SidebarNavigation />
      <main className="dashboard-main">
        {role ? (
          DashboardComponent ? <DashboardComponent /> : <div className="no-permission">권한 없음</div>
        ) : (
          <div className="login-required">로그인 필요</div>
        )}
      </main>
    </div>
  );
}
