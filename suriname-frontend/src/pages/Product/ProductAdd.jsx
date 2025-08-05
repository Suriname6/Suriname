import React, { useState } from "react";
import axios from "axios";
import styles from "../../css/Product/ProductAdd.module.css";
import { useNavigate } from "react-router-dom";

const ProductAdd = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("individual");

  // 일반 등록 폼 상태
  const [individualForm, setIndividualForm] = useState({
    productName: "",
    categoryName: "",
    productBrand: "",
    modelCode: "",
    serialNumber: "",
    memo: "",
  });

  const handleIndividualChange = (field, value) => {
    setIndividualForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIndividualSubmit = async () => {
    try {
      // 필수 필드 검증
      if (
        !individualForm.productName ||
        !individualForm.categoryName ||
        !individualForm.productBrand
      ) {
        alert("제품명, 제품분류, 제조사는 필수 입력 항목입니다.");
        return;
      }

      const response = await axios.post(
        "/api/products/register",
        individualForm
      );

      if (response.data.success) {
        alert("제품이 성공적으로 등록되었습니다.");
        navigate("/product/list");
      } else {
        alert("제품 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("제품 등록 오류:", error);
      alert("제품 등록 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    navigate("/product/list");
  };

  return (
    <div className={styles.productContainer}>
      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "individual" ? styles.active : styles.inactive
            }`}
            onClick={() => setActiveTab("individual")}
          >
            일반 등록
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "excel" ? styles.active : styles.inactive
            }`}
            onClick={() => {
              setActiveTab("excel");
              navigate("/product/upload/excel");
            }}
          >
            엑셀 일괄 등록
          </button>
        </div>
      </div>

      {/* 일반 등록 탭 */}
      {activeTab === "individual" && (
        <div className={styles.sectionContainer}>
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>제품 정보</h2>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>제조사</label>
                <select
                  className={styles.inputControl}
                  value={individualForm.productBrand}
                  onChange={(e) =>
                    handleIndividualChange("productBrand", e.target.value)
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
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>제품분류</label>
                <select
                  className={styles.inputControl}
                  value={individualForm.categoryName}
                  onChange={(e) =>
                    handleIndividualChange("categoryName", e.target.value)
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
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>제품명</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={individualForm.productName}
                  onChange={(e) =>
                    handleIndividualChange("productName", e.target.value)
                  }
                  placeholder="제품명을 입력하세요"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>모델코드</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={individualForm.modelCode}
                  onChange={(e) =>
                    handleIndividualChange("modelCode", e.target.value)
                  }
                  placeholder="모델코드를 입력하세요"
                />
              </div>
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>제품고유번호</label>
                <input
                  type="text"
                  className={styles.inputControl}
                  value={individualForm.serialNumber}
                  onChange={(e) =>
                    handleIndividualChange("serialNumber", e.target.value)
                  }
                  placeholder="시리얼 넘버를 입력하세요"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>비고</label>
                <textarea
                  className={`${styles.inputControl} ${styles.textareaControl}`}
                  value={individualForm.memo}
                  onChange={(e) =>
                    handleIndividualChange("memo", e.target.value)
                  }
                  placeholder="특이사항, 메모 등을 입력하세요 (선택사항)"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              취소
            </button>
            <button
              className={styles.submitButton}
              onClick={handleIndividualSubmit}
            >
              등록
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdd;
