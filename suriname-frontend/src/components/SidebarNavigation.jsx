import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/suriname.png"; 
import './SidebarNavigation.css';

export default function SidebarNavigation() {
  const navigate = useNavigate();

const routeMap = {
  "고객 목록": "/customer/list",
  "고객 등록": "/customer/upload",
 /* "제품 목록": "/product/list",
  "제품 등록": "/product/register",
  "접수 목록": "/request/list",
  "접수 등록": "/request/register",
  "수리 내역": "/repair/list",
  "수리 내역 작성": "/repair/write",
  "프리셋 등록": "/repair/preset",
  "입금 상태 목록": "/payment/status",
  "가상 계좌 발급 요청": "/payment/virtual",
  "배송 목록": "/delivery/list",
  "배송 등록": "/delivery/register",
  "직원 목록": "/staff/list",
  "직원 가입 요청 목록": "/staff/requests",
  "통계": "/dashboard/statistics",
  "담당자별 성과": "/dashboard/performance",
  "리포트": "/dashboard/report",*/
};


  const [hoveredSection, setHoveredSection] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedSubItem, setSelectedSubItem] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);

  const menuData = {
    "고객 관리": ["고객 목록", "고객 등록"],
    "제품 관리": ["제품 목록", "제품 등록"],
    "A/S 접수": ["접수 목록", "접수 등록"],
    "수리 처리": ["수리 내역", "수리 내역 작성", "프리셋 등록"],
    "결제 관리": ["입금 상태 목록", "가상 계좌 발급 요청"],
    "배송 관리": ["배송 목록", "배송 등록"],
    "직원 관리":["직원 목록","직원 가입 요청 목록"],
    "대시 보드":["통계","담당자별 성과","리포트"]
  };

  

const handleSubItemClick = (subItem, parentMenu) => {
  setSelectedSubItem(subItem);
  setActiveSection(parentMenu);

  const route = routeMap[subItem];
  if (route) {
    navigate(route);
  }
};


  const handleMenuGroupEnter = (mainMenu) => {
    setHoveredSection(mainMenu);
  };

  const handleMenuGroupLeave = () => {
    setHoveredSection(null);
    setHoveredSubItem(null);
  };

  return (
    <div className="sidebar">
      <div className="logo-container" onClick={() => navigate("/")}>
        <img src={logo} alt="Suriname Logo" className="logo-image" />
      </div>

      <div className="sidebar-main">
        {Object.keys(menuData).map((mainMenu) => (
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
              menuData[mainMenu].map((subMenu) => (
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
        <div className="logout-button">로그아웃</div>
      </div>
    </div>
  );
}
