import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CustomerDetail = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // 상세 데이터 조회
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`/api/customers/${id}`);
        setFormData(res.data.data);
        setOriginalData(res.data.data);
      } catch (error) {
        console.error("고객 정보 불러오기 실패:", error);
      }
    };

    fetchCustomer();
  }, [id]);

  // 폼 변경 감지
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(originalData));
      return updated;
    });
  };

  // product 필드 변경
  const handleProductChange = (field, value) => {
    setFormData((prev) => {
      const product = prev.products?.[0] || {
        productName: "",
        categoryName: "",
        productBrand: "",
        modelCode: "",
        serialNumber: "",
      };
      const updatedProduct = { ...product, [field]: value };
      const updated = { ...prev, products: [updatedProduct] };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(originalData));
      return updated;
    });
  };

  // 저장
  const handleSave = async () => {
    try {
      await axios.put(`/api/customers/${id}`, formData);
      alert("저장되었습니다.");
      setOriginalData(formData);
      setIsDirty(false);
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 취소
  const handleCancel = () => {
    if (window.confirm("변경사항을 취소하시겠습니까?")) {
      setFormData(originalData);
      setIsDirty(false);
    }
  };

  // 경고창 띄우기 (페이지 이탈 시)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (!formData) return <div style={{ padding: "24px" }}>Loading...</div>;

  const DetailInput = ({ label, value, onChange }) => (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <label style={{ fontWeight: "500", marginBottom: "4px" }}>{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          fontSize: "15px",
          background: "#f9fafb",
        }}
      />
    </div>
  );

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}
      >
        고객 상세 정보
      </h2>

      {/* 고객 정보 */}
      <section style={{ marginBottom: "32px" }}>
        <h3
          style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}
        >
          고객 정보
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <DetailInput
            label="고객명"
            value={formData.name}
            onChange={(val) => handleInputChange("name", val)}
          />
          <DetailInput
            label="연락처"
            value={formData.phone}
            onChange={(val) => handleInputChange("phone", val)}
          />
          <DetailInput
            label="이메일"
            value={formData.email}
            onChange={(val) => handleInputChange("email", val)}
          />
          <DetailInput
            label="생년월일"
            value={formData.birth}
            onChange={(val) => handleInputChange("birth", val)}
          />
          <DetailInput
            label="주소"
            value={formData.address}
            onChange={(val) => handleInputChange("address", val)}
          />
        </div>
      </section>

      {/* 제품 정보 */}
      <section>
        <h3
          style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}
        >
          제품 정보
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <DetailInput
            label="제품명"
            value={formData.products?.[0]?.productName}
            onChange={(val) => handleProductChange("productName", val)}
          />
          <DetailInput
            label="제품분류"
            value={formData.products?.[0]?.categoryName}
            onChange={(val) => handleProductChange("categoryName", val)}
          />
          <DetailInput
            label="제조사"
            value={formData.products?.[0]?.productBrand}
            onChange={(val) => handleProductChange("productBrand", val)}
          />
          <DetailInput
            label="모델코드"
            value={formData.products?.[0]?.modelCode}
            onChange={(val) => handleProductChange("modelCode", val)}
          />
          <DetailInput
            label="제품고유번호"
            value={formData.products?.[0]?.serialNumber}
            onChange={(val) => handleProductChange("serialNumber", val)}
          />
        </div>
      </section>

      {/* 버튼 */}
      <div style={{ marginTop: "40px", textAlign: "right" }}>
        <button
          onClick={handleCancel}
          style={{
            padding: "10px 20px",
            marginRight: "12px",
            backgroundColor: "#eee",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 24px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default CustomerDetail;
