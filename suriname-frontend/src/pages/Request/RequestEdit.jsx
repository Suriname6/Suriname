import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../css/Request/RequestForm.module.css";
import axios from "../../api/axiosInstance";

export default function RequestEdit() {
    const { id } = useParams(); // <-- 요청 번호
    const navigate = useNavigate();
    const role = localStorage.getItem("role");


    // 읽기 전용으로 보여줄 선택 정보들
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedEngineer, setSelectedEngineer] = useState(null);

    // 수정 가능한 필드
    const [content, setContent] = useState("");

    // 파일 업로드
    const [uploadedFiles, setUploadedFiles] = useState([]);

    // 기존 이미지(표시만)
    const [existingImages, setExistingImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`/api/requests/${id}`);
                const d = res.data;

                console.log(d)
                // API 응답 키는 네 DTO에 맞춰서 매핑
                setSelectedCustomer({
                    name: d.customerName,
                    phone: d.customerPhone,
                    email: d.customerEmail,
                    address: d.customerAddress,
                    birth: d.customerBirth,
                });

                setSelectedProduct({
                    name: d.productName,
                    model: d.modelCode,
                    brand: d.productBrand,
                    serial: d.serialNumber,
                    categoryName: d.categoryName,
                    customerProductId: d.customerProductId, // 있으면 보관
                });

                setSelectedEngineer({
                    id: d.employeeId,
                    name: d.engineerName,
                    department: d.engineerDepartment,
                });

                setContent(d.content ?? "");

                setExistingImages(Array.isArray(d.requestImages) ? d.requestImages : []);
            } catch (err) {
                console.error("요청 상세 정보 조회 실패:", err);
                alert("요청 상세 정보를 불러오지 못했습니다.");
                navigate("/request/list");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, navigate]);

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const next = [];
        for (const file of files) {
            if (file.size <= 25 * 1024 * 1024) {
                next.push({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    file,
                });
            } else {
                alert("파일 크기가 25MB를 초과합니다.");
            }
        }
        setUploadedFiles((prev) => [...prev, ...next]);
    };

    const removeFile = (id) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);

            // 1) 내용만 PATCH
            await axios.patch(`/api/requests/${id}`, { content });

            // 2) 파일 있으면 업로드
            if (uploadedFiles.length > 0) {
                const fd = new FormData();
                uploadedFiles.forEach((uf) => fd.append("files", uf.file));
                await axios.post(`/api/requests/${id}/images`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            alert("요청이 수정되었습니다.");
            navigate(`/request/${id}`);
        } catch (err) {
            console.error("수정 실패:", err);
            alert("수정 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => navigate("/request/list");

    if (loading) {
        return (
            <div className={styles.customerContainer}>
                <div className={styles.sectionContainer}>불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className={styles.customerContainer}>
            <div className={styles.tabNavigation}>
                <div className={styles.tabContainer}>
                    <button className={`${styles.tabButton} ${styles.active}`}>A/S 요청 수정</button>
                </div>
            </div>

            <div className={styles.sectionContainer}>
                {/* 고객 정보 (읽기 전용) */}
                <div className={styles.sectionContent}>
                    <h2 className={styles.sectionTitle}>고객 정보</h2>

                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                            <span className={styles.infoLabel}>고객명</span>
                            <span className={styles.infoValue}>{selectedCustomer?.name || "-"}</span>
                        </div>
                        <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                            <span className={styles.infoLabel}>생년월일</span>
                            <span className={styles.infoValue}>{selectedCustomer?.birth || "-"}</span>
                        </div>
                    </div>

                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>전화번호</span>
                            <span className={styles.infoValue}>{selectedCustomer?.phone || "-"}</span>
                        </div>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>이메일</span>
                            <span className={styles.infoValue}>{selectedCustomer?.email || "-"}</span>
                        </div>
                    </div>

                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox} style={{ flex: 1 }}>
                            <span className={styles.infoLabel}>주소</span>
                            <span className={styles.infoValue}>{selectedCustomer?.address || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* 제품 정보 (읽기 전용) */}
                <div className={styles.sectionContent}>
                    <h2 className={styles.sectionTitle}>제품 정보</h2>
                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>카테고리</span>
                            <span className={styles.infoValue}>{selectedProduct?.categoryName || "-"}</span>
                        </div>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>제품명</span>
                            <span className={styles.infoValue}>{selectedProduct?.name || "-"}</span>
                        </div>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>브랜드</span>
                            <span className={styles.infoValue}>{selectedProduct?.brand || "-"}</span>
                        </div>
                    </div>
                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>모델코드</span>
                            <span className={styles.infoValue}>{selectedProduct?.model || "-"}</span>
                        </div>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>시리얼</span>
                            <span className={styles.infoValue}>{selectedProduct?.serial || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* 담당자 정보 (읽기 전용) */}
                <div className={styles.sectionContent}>
                    <h2 className={styles.sectionTitle}>담당자 정보</h2>
                    <div className={styles.customerInfoRow}>
                        <div className={styles.customerInfoBox}>
                            <span className={styles.infoLabel}>수리 담당자</span>
                            <span className={styles.infoValue}>
                {selectedEngineer?.name || "-"}
                                {selectedEngineer?.department ? ` (${selectedEngineer.department})` : ""}
              </span>
                        </div>
                    </div>
                </div>

                {/* 요청 내용 (수정 가능) */}
                <div className={styles.sectionContent}>
                    <h2 className={styles.sectionTitle}>요청 내용</h2>
                    <div className={styles.inputField}>
                        <label className={styles.inputLabel}>내용</label>
                        <textarea
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={styles.inputControl}
                            placeholder="고장 증상, 요청 사항 등을 입력하세요"
                        />
                    </div>
                </div>

                {/* 기존 이미지 (표시만) + 새 이미지 추가 */}
                <div className={styles.sectionContent}>
                    <h2 className={styles.sectionTitle}>사진 첨부</h2>

                    {existingImages?.length > 0 && (
                        <div className={styles.uploadedFiles} style={{ marginBottom: 12 }}>
                            {existingImages.map((url, idx) => (
                                <div key={idx} className={styles.fileItem}>
                                    <a href={url} target="_blank" rel="noreferrer" className={styles.fileName}>
                                        기존 이미지 {idx + 1}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.fileUpload}>
                        <p className={styles.fileInfo}>
                            png, jpg, pdf 형식 / 최대 25MB
                        </p>
                        <div className={styles.dropZone}>
                            <input
                                type="file"
                                multiple
                                accept=".png,.jpg,.jpeg,.pdf"
                                onChange={handleFileUpload}
                                className={styles.fileInput}
                            />
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
                    </div>
                </div>

                {/* 버튼 */}
                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.cancelButton} onClick={handleCancel} disabled={saving}>
                        취소
                    </button>
                    <button type="button" className={styles.submitButton} onClick={handleSubmit} disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </button>
                </div>
            </div>
        </div>
    );
}
