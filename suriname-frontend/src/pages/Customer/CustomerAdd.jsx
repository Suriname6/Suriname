import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerAdd = () => {
  const [selectedTab, setSelectedTab] = useState("general");
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (tab === "excel") {
      navigate("/customer/upload/excel");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birth: "",
    address: "",
    productName: "",
    categoryName: "",
    productBrand: "",
    modelCode: "",
    productId: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const formDataToSend = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      birth: formData.birth,
      address: formData.address,
      product: {
        productId: null,
        productName: formData.productName,
        categoryName: formData.categoryName,
        productBrand: formData.productBrand,
        modelCode: formData.modelCode,
        serialNumber: formData.productId,
      },
    };

    try {
      const response = await axios.post("/api/customers", formDataToSend);
      console.log("등록 성공:", response.data);
      alert("고객 정보가 등록되었습니다!");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    console.log("취소");
  };

  return (
    <div
      style={{
        marginLeft: "200px",
        padding: "32px 24px",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Tab Navigation */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            backgroundColor: "#eff4ff",
            borderRadius: "100px",
            padding: "4px",
            display: "flex",
            width: "100%",
            maxWidth: "1000px",
          }}
        >
          <button
            onClick={() => {
              setSelectedTab("general");
              handleTabClick("general");
            }}
            style={{
              flex: 1,
              padding: "16px 24px",
              border: "none",
              borderRadius: "100px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor:
                selectedTab === "general" ? "#ffffff" : "transparent",
              color: selectedTab === "general" ? "#2563eb" : "#6b7280",
              boxShadow:
                selectedTab === "general"
                  ? "0 1px 3px rgba(0, 0, 0, 0.1)"
                  : "none",
            }}
          >
            일반 등록
          </button>
          <button
            onClick={() => {
              setSelectedTab("excel");
              handleTabClick("excel");
            }}
            style={{
              flex: 1,
              padding: "16px 24px",
              border: "none",
              borderRadius: "100px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor:
                selectedTab === "excel" ? "#ffffff" : "transparent",
              color: selectedTab === "excel" ? "#2563eb" : "#6b7280",
              boxShadow:
                selectedTab === "excel"
                  ? "0 1px 3px rgba(0, 0, 0, 0.1)"
                  : "none",
            }}
          >
            액셀 일괄 등록
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* 고객 정보 섹션 */}
        <div style={{ width: "100%", maxWidth: "600px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#181d27",
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "2px solid #f1f5f9",
            }}
          >
            고객 정보
          </h2>

          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <div
              style={{ flex: 0.7, display: "flex", flexDirection: "column" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                고객명
              </label>
              <input
                type="text"
                placeholder="고객명"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </div>
            <div
              style={{ flex: 1.3, display: "flex", flexDirection: "column" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                연락처
              </label>
              <input
                type="text"
                placeholder="연락처"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            {/* 생년월일 */}
            <div
              style={{ flex: 0.7, display: "flex", flexDirection: "column" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                생년월일
              </label>
              <input
                type="date"
                value={formData.birth}
                onChange={(e) => handleInputChange("birth", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                  color: "#374151",
                }}
              />
            </div>

            {/* 이메일 */}
            <div
              style={{ flex: 1.3, display: "flex", flexDirection: "column" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                이메일
              </label>
              <input
                type="email"
                placeholder="이메일"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                  color: "#374151",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                주소
              </label>
              <input
                type="text"
                placeholder="주소"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#fafbf9ff",
                }}
              />
            </div>
          </div>
        </div>

        {/* 제품 정보 섹션 */}
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#181d27",
              marginBottom: "24px",
              paddingBottom: "12px",
              borderBottom: "2px solid #f1f5f9",
            }}
          >
            제품 정보
          </h2>

          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                제품분류
              </label>
              <input
                type="text"
                placeholder="예: 노트북, 모니터 등"
                value={formData.categoryName}
                onChange={(e) =>
                  handleInputChange("categoryName", e.target.value)
                }
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                제품명
              </label>
              <input
                type="text"
                placeholder="제품명"
                value={formData.productName}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                제조사
              </label>
              <select
                value={formData.productBrand}
                onChange={(e) =>
                  handleInputChange("productBrand", e.target.value)
                }
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <option value="">선택</option>
                <option value="삼성전자">삼성전자</option>
                <option value="LG전자">LG전자</option>
                <option value="Apple">Apple</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <div
              style={{ flex: 0.4, display: "flex", flexDirection: "column" }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                모델코드
              </label>
              <input
                type="text"
                placeholder="모델코드"
                value={formData.modelCode}
                onChange={(e) => handleInputChange("modelCode", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </div>
            <div
              style={{
                flex: 0.4,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                제품고유번호
              </label>
              <input
                type="text"
                placeholder="제품고유번호"
                value={formData.productId}
                onChange={(e) => handleInputChange("productId", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              background: "transparent",
              border: "1px solid #d1d5db",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: "#2563eb",
              border: "1px solid #2563eb",
              color: "white",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAdd;
