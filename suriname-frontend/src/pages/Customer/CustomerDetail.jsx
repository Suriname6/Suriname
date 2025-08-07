import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../../css/Customer/CustomerDetail.module.css";

const CustomerDetail = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  // 데이터 로드
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`/api/customers/${id}`);
        setFormData(res.data.data);
        setOriginalData(res.data.data);
        setProduct(res.data.data.product || null);
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
        setIsDirty(
          JSON.stringify({ ...formData, product: updated }) !==
            JSON.stringify(originalData)
        );

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };

    fetchCategories();
  }, []);

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

  if (!formData) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.customerContainer}>
      <div className={styles.sectionContainer}>
        {/* 고객 정보 섹션 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>고객 정보</h2>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldSmall}`}>
              <label className={styles.inputLabel}>고객명</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className={`${styles.inputField} ${styles.inputFieldLarge}`}>
              <label className={styles.inputLabel}>연락처</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldSmall}`}>
              <label className={styles.inputLabel}>생년월일</label>
              <input
                type="date"
                className={styles.inputControl}
                value={formData.birth || ""}
                onChange={(e) => handleInputChange("birth", e.target.value)}
              />
            </div>
            <div className={`${styles.inputField} ${styles.inputFieldLarge}`}>
              <label className={styles.inputLabel}>이메일</label>
              <input
                type="email"
                className={styles.inputControl}
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldFull}`}>
              <label className={styles.inputLabel}>주소</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 제품 정보 섹션 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>제품 정보</h2>
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 0.8 }}>
              <label className={styles.inputLabel}>제품분류</label>
              <select
                className={styles.inputControl}
                value={product?.categoryId || ""}
                onChange={(e) =>
                  handleProductChange("categoryId", parseInt(e.target.value))
                }
              >
                <option value="">선택</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputField} style={{ flex: 1.2 }}>
              <label className={styles.inputLabel}>제품명</label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="제품명"
                value={product?.productName || ""}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 0.8 }}>
              <label className={styles.inputLabel}>제조사</label>
              <select
                className={styles.inputControl}
                value={product?.productBrand || ""}
                onChange={(e) =>
                  handleInputChange("productBrand", e.target.value)
                }
              >
                <option value="">선택</option>
                <option value="삼성전자">삼성전자</option>
                <option value="LG전자">LG전자</option>
                <option value="Apple">Apple</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className={styles.inputField} style={{ flex: 1.2 }}>
              <label className={styles.inputLabel}>모델코드</label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="모델코드"
                value={product?.modelCode || ""}
                onChange={(e) => handleInputChange("modelCode", e.target.value)}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldFull}`}>
              <label className={styles.inputLabel}>제품고유번호</label>
              <input
                type="text"
                className={styles.inputControl}
                value={product?.serialNumber || ""}
                onChange={(e) =>
                  handleProductChange("serialNumber", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleCancel}
            disabled={!isDirty}
          >
            취소
          </button>
          <button
            className={`${styles.button} ${styles.submitButton}`}
            onClick={handleSave}
            disabled={!isDirty}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
export default CustomerDetail;
