import { Outlet, useLocation } from "react-router-dom";
import SidebarNavigation from "./SidebarNavigation";

function LayoutWithSidebar() {
    const location = useLocation();
    const hideSidebarPaths = ["/login", "/signup"];
    const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);

    return (
        <div className="flex">
            {!shouldHideSidebar && <SidebarNavigation />}
            <div className="flex-1 p-6 bg-gray-100 min-h-screen">
                <Outlet /> {/* 실제 route element들이 여기 그려짐 */}
            </div>
        </div>
    );
}

export default LayoutWithSidebar;
