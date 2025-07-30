import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/suriname.png"; 
import './SidebarNavigation.css';

export default function SidebarNavigation() {
  const navigate = useNavigate();

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
    "배송 관리": ["배송 목록", "배송 등록"]
  };

  const handleSubItemClick = (subItem, parentMenu) => {
    setSelectedSubItem(subItem);
    setActiveSection(parentMenu);
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
