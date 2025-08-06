import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../css/Customer/CustomerAdd.module.css";

const CustomerAdd = () => {
  const [selectedTab, setSelectedTab] = useState("general");
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

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
    serialNumber: "",
  });

  const handleTabClick = (tab) => {
    if (tab === "excel") {
      navigate("/customer/upload/excel");
    }
  };

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
        serialNumber: formData.serialNumber,
      },
    };
    console.log("serial:", formData.serialNumber);

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

  return (
    <div className={styles.customerContainer}>
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${
              selectedTab === "general" ? styles.active : styles.inactive
            }`}
            onClick={() => {
              setSelectedTab("general");
              handleTabClick("general");
            }}
          >
            일반 등록
          </button>
          <button
            className={`${styles.tabButton} ${
              selectedTab === "excel" ? styles.active : styles.inactive
            }`}
            onClick={() => {
              setSelectedTab("excel");
              handleTabClick("excel");
            }}
          >
            엑셀 일괄 등록
          </button>
        </div>
      </div>

      <div className={styles.sectionContainer}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>고객 정보</h2>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 0.5 }}>
              <label
                className={`${styles.inputLabel} ${styles.inputLabelShort}`}
              >
                고객명
              </label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="고객명"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label
                className={`${styles.inputLabel} ${styles.inputLabelLong}`}
              >
                연락처
              </label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="연락처"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 0.7 }}>
              <label
                className={`${styles.inputLabel} ${styles.inputLabelShort}`}
              >
                생년월일
              </label>
              <input
                type="date"
                className={styles.inputControl}
                value={formData.birth}
                onChange={(e) => handleInputChange("birth", e.target.value)}
              />
            </div>
            <div className={styles.inputField} style={{ flex: 1.3 }}>
              <label
                className={`${styles.inputLabel} ${styles.inputLabelLong}`}
              >
                이메일
              </label>
              <input
                type="email"
                className={styles.inputControl}
                placeholder="이메일"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ width: "100%" }}>
              <label className={styles.inputLabel}>주소</label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="주소"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>제품 정보</h2>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 0.8 }}>
              <label className={styles.inputLabel}>제품분류</label>
              <select
                className={styles.inputControl}
                value={formData.categoryName}
                onChange={(e) =>
                  handleInputChange("categoryName", e.target.value)
                }
              >
                <option value="">선택</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                value={formData.productName}
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
                value={formData.productBrand}
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
                value={formData.modelCode}
                onChange={(e) => handleInputChange("modelCode", e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField}>
              <label className={styles.inputLabel}>제품고유번호</label>
              <input
                type="text"
                className={styles.inputControl}
                placeholder="제품고유번호"
                value={formData.serialNumber}
                onChange={(e) =>
                  handleInputChange("serialNumber", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={handleCancel}>
            취소
          </button>
          <button className={styles.submitButton} onClick={handleSubmit}>
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAdd;
