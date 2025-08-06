import React, { useState } from "react";
import SearchBarLayout from "../../components/SearchLayout";
import styles from "../../css/Customer/CustomerSearchBar.module.css";

const StaffSearchBar = ({ onSearch }) => {
  const [form, setForm] = useState({
    name: "",
    staffNumber: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    status: ""
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
        <label className={styles.label}>직원명</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>사원번호</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.staffNumber}
          onChange={(e) => handleChange("staffNumber", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>이메일</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>연락처</label>
        <input
          className={styles.inputField}
          type="text"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
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
        <label className={styles.label}>역할</label>
        <select
          className={styles.selectField}
          value={form.role}
          onChange={(e) => handleChange("role", e.target.value)}
        >
          <option value="">전체</option>
          <option value="ADMIN">관리자</option>
          <option value="STAFF">일반직원</option>
          <option value="ENGINEER">수리기사</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>상태</label>
        <select
          className={styles.selectField}
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="">전체</option>
          <option value="ACTIVE">활성</option>
          <option value="INACTIVE">비활성</option>
        </select>
      </div>
    </SearchBarLayout>
  );
};

export default StaffSearchBar;
