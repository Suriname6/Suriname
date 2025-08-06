import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/suriname.png";
import "../css/SidebarNavigation.css";
import { getUserRole } from "../utils/auth";

export default function SidebarNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeMap = {
    "고객 목록": "/customer/list",
    "고객 등록": "/customer/upload",
    /* "제품 목록": "/product/list",
  "제품 등록": "/product/register",
  "접수 목록": "/request/list",
  "접수 등록": "/request/register",
  "수리 내역": "/repair/list",
  "수리 내역 작성": "/repair/write",
  "프리셋 등록": "/repair/preset",*/
    "입금 상태 목록": "/payment/list",
    "가상 계좌 발급 요청": "/payment/virtualaccount",
    "배송 목록": "/delivery/list",
    "배송 등록": "/delivery/register",
    "배송 분석": "/delivery/analytics",
    /* "직원 목록": "/staff/list",
  "직원 가입 요청 목록": "/staff/requests",*/
  "통계": "/dashboard/statistics",
  "담당자별 성과": "/dashboard/performance",
  "리포트": "/dashboard/report",
  };

  const [hoveredSection, setHoveredSection] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedSubItem, setSelectedSubItem] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);

  const role = getUserRole();

  // URL과 메뉴 매핑
  const urlToMenuMapping = {
    "/payment/list": { parentMenu: "결제 관리", subItem: "입금 상태 목록" },
    "/payment/virtualaccount": {
      parentMenu: "결제 관리",
      subItem: "가상 계좌 발급 요청",
    },
    "/delivery/list": { parentMenu: "배송 관리", subItem: "배송 목록" },
    "/delivery/register": { parentMenu: "배송 관리", subItem: "배송 등록" },
    "/delivery/analytics": { parentMenu: "배송 관리", subItem: "배송 분석" },
    // 추가 경로들을 여기에 매핑
  };

  // URL 변경 시 선택된 메뉴 상태 업데이트
  useEffect(() => {
    const currentPath = location.pathname;
    const menuInfo = urlToMenuMapping[currentPath];

    if (menuInfo) {
      setActiveSection(menuInfo.parentMenu);
      setSelectedSubItem(menuInfo.subItem);
    }
  }, [location.pathname]);

  let filteredMenu = {
    "고객 관리": ["고객 목록", "고객 등록"],
    "제품 관리": ["제품 목록", "제품 등록"],
    "A/S 접수": ["접수 목록", "접수 등록"],
    "수리 처리": ["수리 내역", "수리 내역 작성", "프리셋 등록"],
    "결제 관리": ["입금 상태 목록", "가상 계좌 발급 요청"],
    "배송 관리": ["배송 목록", "배송 등록", "배송 분석"],
  };

  if (role === "ADMIN") {
    filteredMenu["직원 관리"] = ["직원 목록", "직원 가입 요청 목록"];
    filteredMenu["대시 보드"] = ["통계", "담당자별 성과", "리포트"];
  }

  const handleSubItemClick = (subItem, parentMenu) => {
    setSelectedSubItem(subItem);
    setActiveSection(parentMenu);

    const path = routeMap[subItem];
    if (path) {
      navigate(path);
    }
  };

  const handleMenuGroupEnter = (mainMenu) => {
    setHoveredSection(mainMenu);
  };

  const handleMenuGroupLeave = () => {
    setHoveredSection(null);
    setHoveredSubItem(null);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="Suriname Logo" className="logo-image" />
      </div>

      <div className="sidebar-main">
        {Object.keys(filteredMenu).map((mainMenu) => (
          <div
            key={mainMenu}
            onMouseEnter={() => handleMenuGroupEnter(mainMenu)}
            onMouseLeave={handleMenuGroupLeave}
          >
            <div
              className={`main-menu-item ${
                hoveredSection === mainMenu || activeSection === mainMenu
                  ? "main-menu-active"
                  : ""
              }`}
              onClick={() => setActiveSection(mainMenu)}
            >
              <span>{mainMenu}</span>
              <span className="menu-arrow">▼</span>
            </div>

            {(hoveredSection === mainMenu || activeSection === mainMenu) &&
              filteredMenu[mainMenu].map((subMenu) => (
                <div
                  key={subMenu}
                  className={`sub-menu-item ${
                    selectedSubItem === subMenu
                      ? "sub-menu-selected"
                      : hoveredSubItem === subMenu
                      ? "sub-menu-hovered"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredSubItem(subMenu)}
                  onClick={() => handleSubItemClick(subMenu, mainMenu)}
                >
                  {subMenu}
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="logout">
        <div className="logout-button" onClick={handleLogout}>
          로그아웃
        </div>
      </div>
    </div>
  );
}
