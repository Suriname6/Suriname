import React, { useState } from "react";
import SearchBarLayout from "../../components/SearchLayout";
import styles from "../../css/Customer/CustomerSearchBar.module.css";

const CustomerSearchBar = ({ onSearch }) => {
  const [form, setForm] = useState({
    customerName: "",
    address: "",
    productName: "",
    modelCode: "",
    manufacturer: "",
    productBrand: "",
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
        <label className={styles.label}>고객명</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.customerName}
          onChange={(e) => handleChange("customerName", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>주소</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

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
        <label className={styles.label}>모델코드</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.modelCode}
          onChange={(e) => handleChange("modelCode", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>제조사</label>
        <select
          className={styles.selectField}
          value={form.manufacturer}
          onChange={(e) => handleChange("manufacturer", e.target.value)}
        >
          <option value="">선택</option>
          <option value="삼성">삼성</option>
          <option value="LG">LG</option>
          <option value="Apple">Apple</option>
        </select>
      </div>
    </SearchBarLayout>
  );
};

export default CustomerSearchBar;
