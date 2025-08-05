import React, { useState } from "react";
import SearchBarLayout from "../../components/SearchLayout";
import styles from "../../css/Product/ProductSearchBar.module.css";

const ProductSearchBar = ({ onSearch }) => {
  const [form, setForm] = useState({
    productName: "",
    categoryName: "",
    productBrand: "",
    modelCode: "",
    serialNumber: "",
    status: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    onSearch(form);
  };

  return (
    <SearchBarLayout onSearch={handleSearch}>
      <div className={styles.formGroup}>
        <label className={styles.label}>제품명</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.productName}
          onChange={(e) => handleChange("productName", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>제품분류</label>
        <select
          className={styles.selectField}
          value={form.categoryName}
          onChange={(e) => handleChange("categoryName", e.target.value)}
        >
          <option value="">선택</option>
          <option value="노트북">노트북</option>
          <option value="데스크탑">데스크탑</option>
          <option value="태블릿">태블릿</option>
          <option value="스마트폰">스마트폰</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>제조사</label>
        <select
          className={styles.selectField}
          value={form.productBrand}
          onChange={(e) => handleChange("productBrand", e.target.value)}
        >
          <option value="">선택</option>
          <option value="삼성">삼성</option>
          <option value="LG">LG</option>
          <option value="Apple">Apple</option>
          <option value="ASUS">ASUS</option>
          <option value="HP">HP</option>
          <option value="Dell">Dell</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>모델코드</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.modelCode}
          onChange={(e) => handleChange("modelCode", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>제품고유번호</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.serialNumber}
          onChange={(e) => handleChange("serialNumber", e.target.value)}
        />
      </div>
    </SearchBarLayout>
  );
};

export default ProductSearchBar;
