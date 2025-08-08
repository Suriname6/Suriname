import { getUserRole } from "../utils/auth";
import AdminDashboard from "../components/dashboard/AdminDashboard";
import StaffDashboard from "../components/dashboard/StaffDashboard";
import EngineerDashboard from "../components/dashboard/EngineerDashboard";
import SidebarNavigation from "../components/SidebarNavigation";
import "../css/Dashboard.css";

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
