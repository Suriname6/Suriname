import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Request/RequestForm.module.css";
import axios from "../../api/axiosInstance";
import CustomerAutoCompleteProduct from "../../components/AutoComplete/CustomerAutoComplete";

export default function RequestForm() {
  const [formData, setFormData] = useState({
    customerId: "",
    customerProductId: "",
    employeeId: "",
    content: "",
    modelCode: "",
  });

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // 자동완성은 컴포넌트에 위임, 이 값만 유지
  const [searchCustomer, setSearchCustomer] = useState("");

  // 선택 값
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState(null);

  // 고객 제품/엔지니어 목록
  const [customerProducts, setCustomerProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [engineerOptions, setEngineerOptions] = useState([]);
  const [engLoading, setEngLoading] = useState(false);
  const [engError, setEngError] = useState(null);

  // 중복 저장 방지
  const [submitting, setSubmitting] = useState(false);

  // 권한 체크
  useEffect(() => {
    if (!(role === "ADMIN" || role === "STAFF")) {
      navigate("/request/list", { replace: true });
    }
  }, [role, navigate]);

  // 엔지니어 목록
  useEffect(() => {
    let alive = true;
    const fetchEngineers = async () => {
      try {
        setEngLoading(true);
        setEngError(null);
        const res = await axios.get("/api/users/engineers", {
          params: { page: 0, size: 100 },
        });
        if (!alive) return;

        const payload = res?.data?.data ?? res?.data;
        const rawList = Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload)
          ? payload
          : [];
        const mapped = rawList
          .map((e) => ({
            id: e.employeeId ?? e.id,
            name: e.name,
            birth: e.birth,
            address: e.address,
            email: e.email,
            phone: e.phone,
            department: e.department,
          }))
          .filter((e) => e.id != null);
        setEngineerOptions(mapped);
      } catch (err) {
        if (!alive) return;
        console.error("엔지니어 목록 조회 실패:", err);
        setEngError("목록을 불러오지 못했습니다.");
      } finally {
        if (alive) setEngLoading(false);
      }
    };
    fetchEngineers();
    return () => {
      alive = false;
    };
  }, []);

  // 고객 선택 시 처리 (자동완성 컴포넌트의 onSelect에서 호출)
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setSelectedProduct(null);
    setSearchCustomer(customer.name); // 인풋 표시용

    // 선택 바꾸면 폼 초기화
    setFormData((prev) => ({
      ...prev,
      customerId: customer.customerId ?? customer.id,
      customerProductId: "",
      modelCode: "",
    }));

    // 고객 소유 제품 조회
    let alive = true;
    setProductsLoading(true);
    try {
      const res = await axios.get(
        `/api/customers/${customer.customerId ?? customer.id}/products`
      );
      if (!alive) return;

      const payload = res?.data?.data ?? res?.data;
      const array = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
        ? payload.content
        : [];

      const list = array.map((p) => ({
        id: p.customerProductId ?? p.id,
        name: p.productName ?? p.name,
        model: p.modelCode ?? p.model,
        serial: p.serialNumber ?? p.serial,
      }));

      setCustomerProducts(list);

      // 제품이 있으면 첫 번째 자동 선택
      if (list.length > 0) {
        const first = list[0];
        setSelectedProduct(first);
        setFormData((prev) => ({
          ...prev,
          customerProductId: first.id,
          modelCode: first.model ?? "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          customerProductId: "",
          modelCode: "",
        }));
      }
    } catch (err) {
      console.error("고객 제품 목록 조회 실패:", err);
      setCustomerProducts([]);
      setFormData((prev) => ({
        ...prev,
        customerProductId: "",
        modelCode: "",
      }));
    } finally {
      if (alive) setProductsLoading(false);
    }

    return () => {
      alive = false;
    };
  };

  // 제품 선택
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      customerProductId: product.id,
      modelCode: product.model ?? "",
    }));
  };

  // 담당자 선택
  const handleSelectEngineer = (engineer) => {
    setSelectedEngineer(engineer);
    setFormData((prev) => ({
      ...prev,
      employeeId: engineer.id,
    }));
  };

  // 공통 입력 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 저장
  const handleSubmit = async (e) => {
    e.preventDefault?.();
    if (submitting) return;
    if (!formData.customerId) {
      alert("고객을 선택해 주세요.");
      return;
    }
    if (!formData.customerProductId) {
      alert("제품을 선택해 주세요.");
      return;
    }

    const requestData = {
      employeeId: formData.employeeId || null,
      customerId: formData.customerId,
      customerProductId: formData.customerProductId,
      content: formData.content?.trim() || "",
      modelCode: formData.modelCode?.trim() || null,
    };

    setSubmitting(true);
    try {
      const res = await axios.post("/api/requests", requestData);
      console.log("요청 등록 성공:", res.data);
      alert("수리 요청이 저장되었습니다!");
      navigate("/request/list");
    } catch (err) {
      console.error("요청 등록 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/request/list");
  };

  return (
    <div className={styles.customerContainer}>
      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          {/* CSS 모듈용 활성 클래스 분리: styles.tabButtonActive 사용 */}
          <button className={`${styles.tabButton} ${styles.tabButtonActive}`}>
            A/S 요청 등록
          </button>
        </div>
      </div>

      <div className={styles.sectionContainer}>
        {/* 고객 정보 섹션 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>고객 정보</h2>

          <div className={styles.customerInfoRow}>
            {!selectedCustomer ? (
              <div
                className={styles.customerInfoBox}
                style={{ flex: 1, position: "relative" }}
              >
                <span className={styles.infoLabel}>고객명</span>
                <div className={styles.inputWrapper}>
                  <CustomerAutoCompleteProduct
                    value={searchCustomer}
                    onChange={(val) => setSearchCustomer(val)}
                    onSelect={(customer) => handleSelectCustomer(customer)}
                    placeholder="고객명을 입력하세요"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                  <span className={styles.infoLabel}>고객명</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span className={styles.infoValue}>
                      {selectedCustomer.name}
                    </span>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => {
                        setSelectedCustomer(null);
                        setSearchCustomer("");
                        setCustomerProducts([]);
                        setSelectedProduct(null);
                        setFormData((prev) => ({
                          ...prev,
                          customerId: "",
                          customerProductId: "",
                          modelCode: "",
                        }));
                      }}
                    >
                      변경
                    </button>
                  </div>
                </div>

                <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                  <span className={styles.infoLabel}>생년월일</span>
                  <span className={styles.infoValue}>
                    {selectedCustomer.birth || "-"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 고정 정보들 */}
          <div className={styles.customerInfoRow}>
            <div className={styles.customerInfoBox}>
              <span className={styles.infoLabel}>전화번호</span>
              <span className={styles.infoValue}>
                {selectedCustomer?.phone || ""}
              </span>
            </div>
            <div className={styles.customerInfoBox}>
              <span className={styles.infoLabel}>이메일</span>
              <span className={styles.infoValue}>
                {selectedCustomer?.email || ""}
              </span>
            </div>
          </div>
          <div className={styles.customerInfoRow}>
            <div className={styles.customerInfoBox} style={{ flex: 1 }}>
              <span className={styles.infoLabel}>주소</span>
              <span className={styles.infoValue}>
                {selectedCustomer?.address || ""}
              </span>
            </div>
          </div>
        </div>

        {/* 제품 정보 섹션 */}
        {selectedCustomer && (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>제품 정보</h2>

            {productsLoading ? (
              <div className={styles.inputField}>
                <label className={styles.inputLabel}>제품 선택</label>
                <div className={styles.inputControl}>불러오는 중...</div>
              </div>
            ) : (
              <>
                <div className={styles.inputField}>
                  <label className={styles.inputLabel}>제품 선택</label>
                  <select
                    className={styles.inputControl}
                    value={String(selectedProduct?.id ?? "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      const selected = customerProducts.find(
                        (p) => String(p.id) === val
                      );
                      if (selected) handleSelectProduct(selected);
                    }}
                  >
                    <option value="" disabled>
                      {customerProducts.length
                        ? "제품을 선택하세요"
                        : "등록된 제품이 없습니다"}
                    </option>
                    {customerProducts.map((product) => (
                      <option key={product.id} value={String(product.id)}>
                        {product.name}{" "}
                        {product.model ? `(${product.model})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputField} style={{ marginTop: 12 }}>
                  <label className={styles.inputLabel}>모델코드</label>
                  <input
                    type="text"
                    className={styles.inputControl}
                    placeholder="모델코드"
                    value={formData.modelCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        modelCode: e.target.value,
                      }))
                    }
                    disabled={!selectedProduct}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* 담당자 정보 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>담당자 정보</h2>

          <div className={styles.inputField}>
            <label className={styles.inputLabel}>수리 담당자</label>

            {engLoading ? (
              <div className={styles.inputControl}>불러오는 중...</div>
            ) : engError ? (
              <div className={styles.inputControl}>{engError}</div>
            ) : (
              <select
                className={styles.inputControl}
                value={String(selectedEngineer?.id ?? "")}
                onChange={(e) => {
                  const val = e.target.value;
                  const eng = engineerOptions.find((x) => String(x.id) === val);
                  if (eng) handleSelectEngineer(eng);
                }}
              >
                <option value="" disabled>
                  {engineerOptions.length
                    ? "담당자를 선택하세요"
                    : "등록된 담당자가 없습니다"}
                </option>
                {engineerOptions.map((eng) => (
                  <option key={eng.id} value={String(eng.id)}>
                    {eng.name}
                    {eng.department ? ` (${eng.department})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* 요청 내용 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>요청 내용</h2>
          <div className={styles.inputField}>
            <label className={styles.inputLabel}>내용</label>
            <textarea
              name="content"
              rows={4}
              value={formData.content}
              onChange={handleChange}
              className={styles.inputControl}
              placeholder="고장 증상, 요청 사항 등을 입력하세요"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={submitting || productsLoading || engLoading}
          >
            {submitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
