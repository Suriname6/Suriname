import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Request/RequestForm.module.css";
import axios from "../../api/axiosInstance";

export default function RequestForm() {
    const [formData, setFormData] = useState({
        customerId: "",
        customerProductId: "",
        employeeId: "",
        content: "",
    });

    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const [searchCustomer, setSearchCustomer] = useState("");

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedEngineer, setSelectedEngineer] = useState(null);

    const [uploadedFiles, setUploadedFiles] = useState([]);

    const [customerOptions, setCustomerOptions] = useState([]);
    const [custLoading, setCustLoading] = useState(false);

    const [customerProducts, setCustomerProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const [engineerOptions, setEngineerOptions] = useState([]);
    const [engLoading, setEngLoading] = useState(false);
    const [engError, setEngError] = useState(null);

    const [isCustomerFocused, setIsCustomerFocused] = useState(false);

    useEffect(() => {
        if (!searchCustomer.trim()) {
            setCustomerOptions([]);
            return;
        }

        const controller = new AbortController();
        const t = setTimeout(async () => {
            try {
                setCustLoading(true);
                const res = await axios.get("/api/customers/autocomplete", {
                    params: { keyword: searchCustomer },
                    signal: controller.signal,
                });
                setCustomerOptions(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
                    console.error("고객 자동완성 호출 실패:", err);
                }
            } finally {
                setCustLoading(false);
            }
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(t);
        };
    }, [searchCustomer]);

    useEffect(() => {
        const fetchEngineers = async () => {
            try {
                setEngLoading(true);
                setEngError(null);
                const res = await axios.get("/api/users/engineers", { params: { page: 0, size: 100 }});
                const list = Array.isArray(res.data?.content) ? res.data.content : [];
                const mapped = list.map(e => ({
                    id: e.employeeId,
                    name: e.name,
                    birth: e.birth,
                    address: e.address,
                    email: e.email,
                    phone: e.phone
                })).filter(e => e.id != null);
                setEngineerOptions(mapped);
            } catch (err) {
                console.error("엔지니어 목록 조회 실패:", err);
                setEngError("목록을 불러오지 못했습니다.");
            } finally {
                setEngLoading(false);
            }
        };

        fetchEngineers();
    }, []);

    useEffect(() => {
        if (!(role === "ADMIN" || role === "STAFF")) {
            navigate("/request/list", { replace: true });
        }
    }, [role, navigate]);

    const handleSelectCustomer = async (customer) => {
        setSelectedCustomer(customer);
        setSelectedProduct(null);
        setFormData((prev) => ({
            ...prev,
            customerId: customer.customerId,
            customerProductId: "",
        }));
        setSearchCustomer("");
        setCustomerOptions([]);

        setProductsLoading(true);
        try {
            const res = await axios.get(`/api/customers/${customer.customerId}/products`);
            const list = (Array.isArray(res.data) ? res.data : []).map((p) => ({
                id: p.customerProductId ?? p.id,
                name: p.productName ?? p.name,
                model: p.modelCode ?? p.model,
                serial: p.serialNumber ?? p.serial,
            }));
            setCustomerProducts(list);
        } catch (err) {
            console.error("고객 제품 목록 조회 실패:", err);
            setCustomerProducts([]);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setFormData((prev) => ({
            ...prev,
            customerProductId: product.id,
        }));
    };

    const handleSelectEngineer = (engineer) => {
        setSelectedEngineer(engineer);
        setFormData((prev) => ({
            ...prev,
            employeeId: engineer.id,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        files.forEach((file) => {
            if (file.size <= 25 * 1024 * 1024) {
                setUploadedFiles((prev) => [
                    ...prev,
                    {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        file: file,
                    },
                ]);
            } else {
                alert("파일 크기가 25MB를 초과합니다.");
            }
        });
    };
    const removeFile = (id) => {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const requestData = {
            employeeId: formData.employeeId,
            customerId: formData.customerId,
            customerProductId: formData.customerProductId,
            content: formData.content,
        };

        try {
            const res = await axios.post("/api/requests", requestData);
            console.log("요청 등록 성공:", res.data);
            alert("수리 요청이 저장되었습니다!");
            navigate("/request/list");
        } catch (err) {
            console.error("요청 등록 실패:", err);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleCancel = () => {
        navigate("/request/list");
    };

    return (
        <div className={styles.customerContainer}>
            <div className={styles.tabNavigation}>
                <div className={styles.tabContainer}>
                    <button className={`${styles.tabButton} ${styles.active}`}>A/S 요청 등록</button>
                </div>
            </div>

            <div className={styles.sectionContainer}>
                {/* 고객 정보 섹션 */}
                <div className={styles.sectionContent}>
                    <h2 className={styles.sectionTitle}>고객 정보</h2>

                    <div className={styles.customerInfoRow}>
                        {!selectedCustomer ? (
                            <div className={styles.customerInfoBox} style={{ flex: 1, position: "relative" }}>
                                <span className={styles.infoLabel}>고객명</span>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        value={searchCustomer}
                                        onChange={(e) => setSearchCustomer(e.target.value)}
                                        onFocus={() => setIsCustomerFocused(true)}
                                        onBlur={() => setTimeout(() => setIsCustomerFocused(false), 150)}
                                        className={styles.inputControl}
                                        placeholder="고객명을 입력하세요"
                                        autoComplete="off"
                                    />
                                    {searchCustomer && isCustomerFocused && (custLoading || customerOptions.length > 0) && (
                                        <ul className={styles.suggestionList}>
                                            {custLoading && <li className={styles.suggestionItem}>불러오는 중...</li>}
                                            {!custLoading &&
                                                customerOptions.map((customer) => (
                                                    <li
                                                        key={customer.id}
                                                        className={styles.suggestionItem}
                                                        onMouseDown={(e) => e.preventDefault()} // blur 전에 클릭 반영
                                                        onClick={() => handleSelectCustomer(customer)}
                                                    >
                                                        {customer.name} {customer.phone ? `(${customer.phone})` : ""}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                                    <span className={styles.infoLabel}>고객명</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span className={styles.infoValue}>{selectedCustomer.name}</span>
                                        <button
                                            type="button"
                                            className={styles.editButton}
                                            onClick={() => {
                                                setSelectedCustomer(null);
                                                setSearchCustomer("");
                                                setCustomerOptions([]);
                                                setCustomerProducts([]);
                                                setSelectedProduct(null);
                                                setFormData((prev) => ({ ...prev, customerId: "", customerProductId: "" }));
                                            }}
                                        >
                                            변경
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                                    <span className={styles.infoLabel}>생년월일</span>
                                    <span className={styles.infoValue}>{selectedCustomer.birth || "-"}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 고정 정보들 */}
                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>전화번호</span>
                            <span className={styles.infoValue}>{selectedCustomer?.phone || ""}</span>
                        </div>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>이메일</span>
                            <span className={styles.infoValue}>{selectedCustomer?.email || ""}</span>
                        </div>
                    </div>
                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                            <span className={styles.infoLabel}>주소</span>
                            <span className={styles.infoValue}>{selectedCustomer?.address || ""}</span>
                        </div>
                    </div>
                </div>

                {selectedCustomer && (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>제품 정보</h2>

                        {productsLoading ? (
                            <div className={styles.inputField}>
                                <label className={styles.inputLabel}>제품 선택</label>
                                <div className={styles.inputControl}>불러오는 중...</div>
                            </div>
                        ) : (
                            <div className={styles.inputField}>
                                <label className={styles.inputLabel}>제품 선택</label>
                                <select
                                    className={styles.inputControl}
                                    value={selectedProduct?.id || ""}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        const selected = customerProducts.find((p) => p.id === val);
                                        if (selected) handleSelectProduct(selected);
                                    }}
                                >
                                    <option value="" disabled>
                                        {customerProducts.length ? "제품을 선택하세요" : "등록된 제품이 없습니다"}
                                    </option>
                                    {customerProducts.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.model})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}


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
                                value={selectedEngineer?.id ?? ""}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const eng = engineerOptions.find(x => x.id === val);
                                    if (eng) handleSelectEngineer(eng);
                                }}
                            >
                                <option value="" disabled>
                                    {engineerOptions.length ? "담당자를 선택하세요" : "등록된 담당자가 없습니다"}
                                </option>
                                {engineerOptions.map(eng => (
                                    <option key={eng.id} value={eng.id}>
                                        {eng.name}{eng.department ? ` (${eng.department})` : ""}
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

                {/* 사진 첨부 (그대로) */}
                <div className={styles.sectionContent}>
                    <h2 className={styles.sectionTitle}>사진 첨부</h2>
                    <div className={styles.fileUpload}>
                        <p className={styles.fileInfo}>
                            Please upload files in png, jpg, pdf format and make sure the file size is under 25 MB.
                        </p>

                        <div className={styles.dropZone}>
                            <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf" onChange={handleFileUpload} className={styles.fileInput} />
                            <div className={styles.dropText}>Drop file or Browse</div>
                            <div className={styles.formatText}>Format: png, jpg, pdf | Max file size: 25 MB</div>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className={styles.uploadedFiles}>
                                {uploadedFiles.map((file) => (
                                    <div key={file.id} className={styles.fileItem}>
                                        <span className={styles.fileName}>📎 {file.name}</span>
                                        <button className={styles.removeFileBtn} onClick={() => removeFile(file.id)}>
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.uploadActions}>
                            <button className={styles.uploadBtn}>업로드</button>
                        </div>
                    </div>
                </div>

                {/* 버튼 */}
                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                        취소
                    </button>
                    <button type="button" className={styles.submitButton} onClick={handleSubmit}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
