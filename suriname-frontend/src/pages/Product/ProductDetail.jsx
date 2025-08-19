import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import styles from "../../css/Product/ProductDetail.module.css";
import api from "../../api/api";

const CUSTOM_OPTION = "__CUSTOM__";
const BRAND_OPTIONS = [
  "Samsung",
  "LG",
  "Apple",
  "ASUS",
  "HP",
  "Dell",
  "Carrier",
  "기타",
];

const ProductDetail = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [categories, setCategories] = useState([]);

  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [customBrand, setCustomBrand] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setFormData(res.data.data);
        setOriginalData(res.data.data);
      } catch (error) {
        console.error("제품 정보 불러오기 실패:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("카테고리 목록 불러오기 실패:", error);
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  const normalizedCategories = useMemo(() => {
    return (categories || [])
      .map((c, idx) =>
        typeof c === "string"
          ? { id: c, name: c }
          : {
              id: c?.id ?? `cat-${idx}-${c?.name ?? "unknown"}`,
              name: c?.name ?? "",
            }
      )
      .filter((c) => c.name);
  }, [categories]);

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

  const handleSave = async () => {
    try {
      if (
        !formData.productName?.trim() ||
        !formData.categoryName?.trim() ||
        !formData.productBrand?.trim()
      ) {
        alert("제품명, 제품분류, 제조사는 필수 입력 항목입니다.");
        return;
      }
      await api.put(`/api/products/${id}`, formData);
      alert("저장되었습니다.");
      setOriginalData(formData);
      setIsDirty(false);
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("변경사항을 취소하시겠습니까?")) {
      setFormData(originalData);
      setIsDirty(false);
      setUseCustomBrand(false);
      setUseCustomCategory(false);
      setCustomBrand("");
      setCustomCategory("");
    }
  };

  const handleBrandSelect = (e) => {
    const value = e.target.value;
    if (value === CUSTOM_OPTION) {
      setUseCustomBrand(true);
      setCustomBrand("");
      handleInputChange("productBrand", "");
    } else {
      setUseCustomBrand(false);
      setCustomBrand("");
      handleInputChange("productBrand", value);
    }
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    if (value === CUSTOM_OPTION) {
      setUseCustomCategory(true);
      setCustomCategory("");
      handleInputChange("categoryName", "");
    } else {
      setUseCustomCategory(false);
      setCustomCategory("");
      handleInputChange("categoryName", value);
    }
  };

  const handleCustomBrandChange = (e) => {
    const v = e.target.value;
    setCustomBrand(v);
    handleInputChange("productBrand", v);
  };
  const handleCustomCategoryChange = (e) => {
    const v = e.target.value;
    setCustomCategory(v);
    handleInputChange("categoryName", v);
  };

  if (!formData) return <div className={styles.loading}>Loading...</div>;
  const brandIsListed = BRAND_OPTIONS.includes(formData.productBrand);
  const categoryIsListed = normalizedCategories.some(
    (c) => c.name === formData.categoryName
  );

  return (
    <div className={styles.productContainer}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>제품 정보</h2>

          <div className={styles.inputGroup}>
            <div className={`${styles.inputField} ${styles.inputFieldEqual}`}>
              <label className={styles.inputLabel}>제조사</label>

              {!useCustomBrand ? (
                <select
                  className={styles.inputControl}
                  value={
                    brandIsListed
                      ? formData.productBrand
                      : formData.productBrand || ""
                  }
                  onChange={handleBrandSelect}
                >
                  <option value="">선택</option>
                  {BRAND_OPTIONS.map((b) => (
                    <option key={`brand-${b}`} value={b}>
                      {b}
                    </option>
                  ))}
                  {/* 현재 값이 목록에 없으면 드롭다운에도 표시되도록 임시 옵션 */}
                  {!brandIsListed && formData.productBrand && (
                    <option value={formData.productBrand}>
                      {formData.productBrand} (현재 값)
                    </option>
                  )}
                  <option value={CUSTOM_OPTION}>직접 입력</option>
                </select>
              ) : (
                <div className={styles.inlineRow}>
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="제조사를 입력하세요"
                    value={customBrand}
                    onChange={handleCustomBrandChange}
                  />
                  <button
                    type="button"
                    className={styles.smallButton}
                    onClick={() => {
                      setUseCustomBrand(false);
                      setCustomBrand("");
                      handleInputChange("productBrand", "");
                    }}
                  >
                    드롭다운
                  </button>
                </div>
              )}
            </div>

            {/* 제품분류 */}
            <div className={`${styles.inputField} ${styles.inputFieldEqual}`}>
              <label className={styles.inputLabel}>제품분류</label>

              {!useCustomCategory ? (
                <select
                  className={styles.inputControl}
                  value={
                    categoryIsListed
                      ? formData.categoryName
                      : formData.categoryName || ""
                  }
                  onChange={handleCategorySelect}
                >
                  <option value="">선택</option>
                  {normalizedCategories.map((cat) => (
                    <option key={`cat-${cat.id ?? cat.name}`} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                  {!categoryIsListed && formData.categoryName && (
                    <option value={formData.categoryName}>
                      {formData.categoryName} (현재 값)
                    </option>
                  )}
                  <option value={CUSTOM_OPTION}>직접 입력</option>
                </select>
              ) : (
                <div className={styles.inlineRow}>
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="제품분류를 입력하세요"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    list="category-suggestions"
                  />
                  <button
                    type="button"
                    className={styles.smallButton}
                    onClick={() => {
                      setUseCustomCategory(false);
                      setCustomCategory("");
                      handleInputChange("categoryName", "");
                    }}
                  >
                    드롭다운
                  </button>

                  {/* 자동완성 힌트 */}
                  <datalist id="category-suggestions">
                    {normalizedCategories.map((cat) => (
                      <option
                        value={cat.name}
                        key={`dl-${cat.id ?? cat.name}`}
                      />
                    ))}
                  </datalist>
                </div>
              )}
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
