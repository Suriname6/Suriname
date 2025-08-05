import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CustomerDetail = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [product, setProduct] = useState(null);

  // 데이터 로드
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`/api/customers/${id}`);
        setFormData(res.data.data);
        setOriginalData(res.data.data);
        setProduct(res.data.data.products?.[0] || null);
      } catch (error) {
        console.error("고객 정보 불러오기 실패:", error);
      }
    };
    fetchCustomer();
  }, [id]);

  // 입력 변경 핸들러
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        setIsDirty(JSON.stringify(updated) !== JSON.stringify(originalData));
        return updated;
      });
    },
    [originalData]
  );

  const handleProductChange = useCallback(
    (field, value) => {
      setProduct((prev) => {
        const updated = { ...prev, [field]: value };
        setIsDirty(
          JSON.stringify({ ...formData, product: [updated] }) !==
            JSON.stringify(originalData)
        );
        return updated;
      });
    },
    [formData, originalData]
  );

  // 페이지 이동 방지
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // 저장 함수
  const handleSave = async () => {
    try {
      const saveData = { ...formData, product: product };
      await axios.put(`/api/customers/${id}`, saveData);
      alert("저장되었습니다.");
      setOriginalData(saveData);
      setIsDirty(false);
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 취소 함수
  const handleCancel = () => {
    if (window.confirm("변경사항을 취소하시겠습니까?")) {
      setFormData(originalData);
      setProduct(originalData.product || {});
      setIsDirty(false);
    }
  };

  if (!formData) return <div style={{ padding: "24px" }}>Loading...</div>;

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* 고객 정보 섹션 */}
        <div style={{ width: "100%", maxWidth: "600px", marginBottom: "48px" }}>
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
                value={formData.name || ""}
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
                value={formData.phone || ""}
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
                value={formData.birth || ""}
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
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
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

          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
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
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>

        {/* 제품 정보 섹션 */}
        <div style={{ width: "100%", maxWidth: "600px", marginBottom: "48px" }}>
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
                value={product?.categoryName || ""}
                onChange={(e) =>
                  handleProductChange("categoryName", e.target.value)
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
                value={product?.productName || ""}
                onChange={(e) =>
                  handleProductChange("productName", e.target.value)
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
          </div>

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
                제조사
              </label>
              <select
                value={product?.productBrand || ""}
                onChange={(e) =>
                  handleProductChange("productBrand", e.target.value)
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

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
                value={product?.modelCode || ""}
                onChange={(e) =>
                  handleProductChange("modelCode", e.target.value)
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
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
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
                value={product?.serialNumber || ""}
                onChange={(e) =>
                  handleProductChange("serialNumber", e.target.value)
                }
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  backgroundColor: "#f9fafb",
                  width: "100%",
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
            disabled={!isDirty}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: isDirty ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              background: "transparent",
              border: "1px solid #d1d5db",
              color: "#374151",
              opacity: isDirty ? 1 : 0.5,
            }}
            onMouseOver={(e) =>
              isDirty && (e.target.style.backgroundColor = "#f9fafb")
            }
            onMouseOut={(e) =>
              isDirty && (e.target.style.backgroundColor = "transparent")
            }
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: isDirty ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              backgroundColor: "#2563eb",
              border: "1px solid #2563eb",
              color: "white",
              opacity: isDirty ? 1 : 0.5,
            }}
            onMouseOver={(e) =>
              isDirty && (e.target.style.backgroundColor = "#1d4ed8")
            }
            onMouseOut={(e) =>
              isDirty && (e.target.style.backgroundColor = "#2563eb")
            }
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
