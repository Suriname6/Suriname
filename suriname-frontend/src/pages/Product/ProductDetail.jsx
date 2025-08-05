import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../../css/Product/ProductDetail.module.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // 데이터 로드
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setFormData(res.data.data);
        setOriginalData(res.data.data);
        console.log(res.data.data);
      } catch (error) {
        console.error("제품 정보 불러오기 실패:", error);
      }
    };
    fetchProduct();
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
      // 필수 필드 검증
      if (
        !formData.productName ||
        !formData.categoryName ||
        !formData.productBrand
      ) {
        alert("제품명, 제품분류, 제조사는 필수 입력 항목입니다.");
        return;
      }

      await axios.put(`/api/products/${id}`, formData);
      alert("저장되었습니다.");
      setOriginalData(formData);
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
      setIsDirty(false);
    }
  };

  if (!formData) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.productContainer}>
      <div className={styles.sectionContainer}>
        {/* 제품 정보 섹션 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>제품 정보</h2>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldEqual}`}>
              <label className={styles.inputLabel}>제조사</label>
              <select
                className={styles.inputControl}
                value={formData.productBrand || ""}
                onChange={(e) =>
                  handleInputChange("productBrand", e.target.value)
                }
              >
                <option value="">선택</option>
                <option value="삼성">삼성</option>
                <option value="LG">LG</option>
                <option value="Apple">Apple</option>
                <option value="ASUS">ASUS</option>
                <option value="HP">HP</option>
                <option value="Dell">Dell</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className={`${styles.inputField} ${styles.inputFieldEqual}`}>
              <label className={styles.inputLabel}>제품분류</label>
              <select
                className={styles.inputControl}
                value={formData.categoryName || ""}
                onChange={(e) =>
                  handleInputChange("categoryName", e.target.value)
                }
              >
                <option value="">선택</option>
                <option value="노트북">노트북</option>
                <option value="데스크탑">데스크탑</option>
                <option value="태블릿">태블릿</option>
                <option value="스마트폰">스마트폰</option>
                <option value="모니터">모니터</option>
                <option value="프린터">프린터</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldFull}`}>
              <label className={styles.inputLabel}>제품명</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.productName || ""}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
                placeholder="제품명을 입력하세요"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldEqual}`}>
              <label className={styles.inputLabel}>모델코드</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.modelCode || ""}
                onChange={(e) => handleInputChange("modelCode", e.target.value)}
                placeholder="모델코드를 입력하세요"
              />
            </div>
            <div className={`${styles.inputField} ${styles.inputFieldEqual}`}>
              <label className={styles.inputLabel}>제품고유번호</label>
              <input
                type="text"
                className={styles.inputControl}
                value={formData.serialNumber || ""}
                onChange={(e) =>
                  handleInputChange("serialNumber", e.target.value)
                }
                placeholder="시리얼 넘버를 입력하세요"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldFull}`}>
              <label className={styles.inputLabel}>비고</label>
              <textarea
                className={`${styles.inputControl} ${styles.textareaControl}`}
                value={formData.memo || ""}
                onChange={(e) => handleInputChange("memo", e.target.value)}
                placeholder="특이사항, 메모 등을 입력하세요 (선택사항)"
                rows="3"
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

export default ProductDetail;
