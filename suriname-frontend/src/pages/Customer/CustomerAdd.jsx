import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Customer/CustomerAdd.module.css";
import AutoComplete from "../../components/AutoComplete/ProductAutoComplete";
import api from "../../api/api";

const CustomerAdd = () => {
  const [selectedTab, setSelectedTab] = useState("general");
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const BRAND_OPTIONS = ["Samsung", "LG", "Apple", "기타"];
  const detailAddrRef = useRef(null);

  const INITIAL_FORM = {
    name: "",
    phone: "",
    email: "",
    birth: "",
    address: "",
    addressDetail: "",
    productName: "",
    categoryName: "",
    productBrand: "",
    modelCode: "",
    productId: "",
    serialNumber: "",
  };

  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleTabClick = (tab) => {
    if (tab === "excel") {
      navigate("/customer/register/excel");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatPhone010 = (value) => {
    let d = value.replace(/\D/g, "").slice(0, 11);
    if (d && !d.startsWith("010")) d = "010" + d.replace(/^010?/, "");
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: formatPhone010(value) }));
  };

  const EMAIL_DOMAINS = [
    "직접 입력",
    "naver.com",
    "gmail.com",
    "daum.net",
    "kakao.com",
  ];
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomainSelect, setEmailDomainSelect] = useState("직접 입력");
  const [emailDomainCustom, setEmailDomainCustom] = useState("");

  useEffect(() => {
    const domain =
      emailDomainSelect === "직접 입력"
        ? emailDomainCustom.trim()
        : emailDomainSelect;
    const local = emailLocal.trim();
    const email = local && domain ? `${local}@${domain}` : "";
    setFormData((prev) => ({ ...prev, email }));
  }, [emailLocal, emailDomainSelect, emailDomainCustom]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("카테고리 불러오기 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("FormData 업데이트:", formData);
  }, [formData]);

  const loadDaumPostcode = () =>
    new Promise((resolve) => {
      if (window.daum?.Postcode) return resolve();
      const s = document.createElement("script");
      s.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      s.onload = resolve;
      document.head.appendChild(s);
    });

  const openAddressSearch = async () => {
    await loadDaumPostcode();
    new window.daum.Postcode({
      oncomplete: (data) => {
        const road = data.roadAddress;
        const jibun = data.jibunAddress;
        const addr = road || jibun || "";
        handleInputChange("address", addr);
        handleInputChange("addressDetail", "");
        setTimeout(() => detailAddrRef.current?.focus(), 0);
      },
    }).open();
  };

  const handleSubmit = async () => {
    const addressFull = [formData.address, formData.addressDetail]
      .filter(Boolean)
      .join(" ");

    const formDataToSend = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      birth: formData.birth,
      address: addressFull,
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
      const response = await api.post("/api/customers", formDataToSend);
      console.log("등록 성공:", response.data);
      alert("고객 정보가 등록되었습니다!");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("작성내용을 취소하시겠습니까?")) {
      setFormData(INITIAL_FORM);
    }
  };

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
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                inputMode="numeric"
                autoComplete="tel"
                maxLength={13}
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

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="text"
                  className={styles.inputControl}
                  placeholder="아이디"
                  value={emailLocal}
                  onChange={(e) =>
                    setEmailLocal(e.target.value.replace(/\s/g, ""))
                  }
                  autoComplete="username"
                  style={{ flex: 1 }}
                />
                <span>@</span>
                <select
                  className={styles.inputControl}
                  value={emailDomainSelect}
                  onChange={(e) => setEmailDomainSelect(e.target.value)}
                  style={{ flex: 1.1 }}
                >
                  {EMAIL_DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {emailDomainSelect === "직접 입력" && (
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="domain.com"
                    value={emailDomainCustom}
                    onChange={(e) =>
                      setEmailDomainCustom(
                        e.target.value.replace(/\s/g, "").toLowerCase()
                      )
                    }
                    autoComplete="email"
                    style={{ flex: 1 }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>주소</label>
              <div className={styles.addressRow}>
                <input
                  type="text"
                  className={styles.inputControl}
                  placeholder="주소 검색 버튼으로 선택"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  readOnly
                />
                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={openAddressSearch}
                >
                  주소 검색
                </button>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>상세 주소</label>
              <input
                ref={detailAddrRef}
                type="text"
                className={styles.inputControl}
                placeholder="상세 주소 (동/호수 등)"
                value={formData.addressDetail}
                onChange={(e) =>
                  handleInputChange("addressDetail", e.target.value)
                }
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
              <AutoComplete
                label="제품명"
                placeholder="제품명"
                value={formData.productName}
                className={styles.inputControl}
                onChange={(val) => {
                  console.log("입력값 변경:", val);
                  handleInputChange("productName", val);
                }}
                onSelect={(product) => {
                  console.log("제품 선택됨:", product);
                  setFormData((prev) => ({
                    ...prev,
                    productName: product.productName,
                    modelCode: product.modelCode,
                    productBrand: product.productBrand,
                    categoryName: product.categoryName,
                    productId: product.productId,
                  }));
                }}
                fetchUrl="/api/products/autocomplete"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 0.8 }}>
              <label className={styles.inputLabel}>제조사</label>
              <select
                className={styles.inputControl}
                value={formData.productBrand || ""}
                onChange={(e) =>
                  handleInputChange("productBrand", e.target.value)
                }
              >
                <option value="">선택</option>
                {BRAND_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                {formData.productBrand &&
                  !BRAND_OPTIONS.includes(formData.productBrand) && (
                    <option value={formData.productBrand}>
                      {formData.productBrand}
                    </option>
                  )}
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
