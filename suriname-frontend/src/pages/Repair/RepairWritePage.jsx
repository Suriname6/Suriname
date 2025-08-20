import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarNavigation from "../../components/SidebarNavigation";
import styles from "../../css/Repair/RepairWrite.module.css";
import { X } from "lucide-react";
import axios from "../../api/axiosInstance";
import CategoryPresetPicker from "../../components/repairpreset/CategoryPresetPicker";

const idGen = (p = "id") =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function parseQuoteFieldToItems(field) {
  if (!field) return [];
  try {
    return field
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => {
        const m = line.match(/^- (.+?): (.+?) \((\d+)원\)$/);
        if (!m) return null;
        return {
          id: idGen("parsed"),
          itemName: m[1],
          description: m[2],
          cost: Number.parseInt(m[3]) || 0,
          isPreset: false,
          isEditing: false,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

const RepairWritePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const requestId = location.state?.requestId || null;
  const quoteId = location.state?.quoteId || null;
  const editMode = location.state?.mode === "edit";

  const [formData, setFormData] = useState({
    customerName: "",
    requestNo: "",
    engineerName: "", // 자동 채움, 읽기 전용
    productName: "",
    customerConsent: false,
    createdDate: new Date().toISOString().split("T")[0],
  });

  const [repairItems, setRepairItems] = useState([]);
  const [directInputItems, setDirectInputItems] = useState([
    {
      id: idGen("initial"),
      itemName: "",
      description: "",
      cost: "",
      isEditing: true,
    },
  ]);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  const [isActualCostManuallyEdited, setIsActualCostManuallyEdited] =
    useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!requestId) {
      alert("잘못된 접근입니다. (requestId 없음)");
      navigate("/repair/list");
      return;
    }

  const loadQuoteForEdit = async (qid) => {
      try {
          const res = await axios.get(`/api/quotes/${qid}`);
                const q = res?.data?.data || res?.data || null;
                            if (!q) return;

      // 비용/동의/생성일/담당자 반영
      if (typeof q.cost === "number") {
        setActualCost(q.cost);
                setIsActualCostManuallyEdited(true);
      }
      setFormData(prev => ({
        ...prev,
        customerConsent: !!(q.isApproved ?? q.customerConsent),
        createdDate: q.createdAt ? String(q.createdAt).split("T")[0] : prev.createdDate,
        engineerName: q.engineerName || q.employeeName || prev.engineerName,
      }));

      // field → directInputItems 파싱
      const parsed = parseQuoteFieldToItems(q.field);
      if (parsed.length > 0) {
        setDirectInputItems([
          ...parsed,
          { id: idGen("new"), itemName: "", description: "", cost: "", isEditing: true },
        ]);
      }
    } catch (e) {
      console.warn("기존 견적 로드 실패(무시):", e);
    }
  };

    (async () => {
      try {
        // 요청 상세
        const res = await axios.get(`/api/requests/${requestId}`);
        const d = res?.data?.data || res?.data || {};
        setFormData((prev) => ({
          ...prev,
          requestId: d.requestId,
          requestNo: d.requestNo || d.request_no || "",
          customerName:
            d.customerName ||
            d.customer?.name ||
            d.customer_name ||
            prev.customerName,
          productName:
            d.productName ||
            d.product?.productName ||
            d.product?.name ||
            prev.productName,
          engineerName: d.engineerName || "",
        }));

        if (editMode) {
            await loadQuoteForEdit(quoteId);
        }

        // 이미지 목록
        const imgRes = await axios.get(`/api/images/request/${requestId}`);
        if (imgRes?.data?.status === 200 && Array.isArray(imgRes.data.data)) {
          setUploadedImages(imgRes.data.data);
        }
      } catch (err) {
        console.error("요청 상세 정보 조회 실패:", err);
        alert("요청 상세 정보를 불러오지 못했습니다.");
        navigate("/repair/list");
      }
    })();
  }, [requestId, editMode, navigate]);

  // --- 합계 계산 ---
  useEffect(() => {
    const sum = (arr) =>
      arr.reduce((acc, it) => acc + (Number.parseInt(it.cost) || 0), 0);
    const total =
      sum(repairItems) +
      sum(directInputItems.filter((i) => !i.isEditing && i.itemName));
    setEstimatedCost(total);
    if (!isActualCostManuallyEdited) setActualCost(total);
  }, [repairItems, directInputItems, isActualCostManuallyEdited]);

  // --- 이미지 업로드/삭제 ---
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter(
      (f) => f.type.startsWith("image/") && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(f.name)
    );

    if (imageFiles.length === 0) {
      alert(
        "이미지 파일만 업로드 가능합니다.\n지원 형식: JPG, JPEG, PNG, GIF, BMP, WebP"
      );
      fileInputRef.current && (fileInputRef.current.value = "");
      return;
    }
    if (imageFiles.length < files.length) {
      alert(`${files.length - imageFiles.length}개 파일은 이미지가 아니라 제외되었습니다.`);
    }

    if (!requestId) {
      alert("requestId가 없어 이미지를 업로드할 수 없습니다.");
      return;
    }

    setUploading(true);
    try {
      const ok = [];
      for (const file of imageFiles) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}의 크기가 10MB를 초과합니다.`);
          continue;
        }
        try {
          const form = new FormData();
          form.append("file", file);
          const res = await axios.post(`/api/images/upload/${requestId}`, form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data.status === 201) {
            const list = await axios.get(`/api/images/request/${requestId}`);
            if (list.data.status === 200) {
              const newImg = list.data.data.find(
                (img) => img.imageId === res.data.data.imageId
              );
              if (newImg) ok.push(newImg);
            }
          }
        } catch (err) {
          console.error(`업로드 실패: ${file.name}`, err);
          alert(`${file.name} 업로드 실패`);
        }
      }
      if (ok.length > 0) setUploadedImages((prev) => [...prev, ...ok]);
    } finally {
      setUploading(false);
      fileInputRef.current && (fileInputRef.current.value = "");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      const res = await axios.delete(`/api/images/${imageId}`);
      if (res.data.status === 200) {
        setUploadedImages((prev) =>
          prev.filter((img) => img.imageId !== imageId)
        );
        alert("이미지가 삭제되었습니다.");
      }
    } catch (error) {
      console.error("이미지 삭제 실패:", error);
      alert("이미지 삭제에 실패했습니다.");
    }
  };

  // --- 수리 항목 (직접입력) ---
  const handleDirectInputChange = (id, field, value) => {
    setDirectInputItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };
  const addDirectInputItem = () =>
    setDirectInputItems((prev) => [
      ...prev,
      { id: idGen("direct"), itemName: "", description: "", cost: "", isEditing: true },
    ]);
  const confirmDirectInputItem = (id) => {
    const item = directInputItems.find((i) => i.id === id);
    if (item && item.itemName && item.description && item.cost !== "") {
      setDirectInputItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isEditing: false } : i))
      );
    } else {
      alert("모든 필드를 입력해주세요.");
    }
  };
  const removeDirectInputItem = (id) =>
    setDirectInputItems((prev) => prev.filter((item) => item.id !== id));
  const removeRepairItem = (id) =>
    setRepairItems((prev) => prev.filter((item) => item.id !== id));

  // --- 저장 ---
  const handleSubmit = async () => {
    if (saving) return;

    const allRepairItems = [
      ...repairItems,
      ...directInputItems.filter((item) => !item.isEditing && item.itemName),
    ];
    if (allRepairItems.length === 0) {
      alert("최소 하나의 수리 항목을 추가해주세요.");
      return;
    }

    const quoteData = {
      requestId: formData.requestId,
      customerConsent: formData.customerConsent,
      estimatedCost,
      actualCost,
      repairItems: [
        ...repairItems.map((item) => ({
          itemName: item.itemName,
          description: item.description,
          cost: Number.parseInt(item.cost) || 0,
          presetId: item.presetId || null,
        })),
        ...directInputItems
          .filter((item) => !item.isEditing && item.itemName)
          .map((item) => ({
            itemName: item.itemName,
            description: item.description,
            cost: Number.parseInt(item.cost) || 0,
            presetId: null,
          })),
      ],
    };

    setSaving(true);
    try {
      let response;
      if (editMode) {
        const createResponse = await axios.post("/api/quotes", quoteData);

        if (createResponse.data.status === 201) {
          try {
            await axios.delete(`/api/quotes/${quoteId}`);
          } catch (e) {
            console.warn("기존 견적서 삭제 실패(무시):", e);
          }
          response = createResponse;
        } else {
          throw new Error("견적서 생성 실패");
        }
      } else {
        response = await axios.post("/api/quotes", quoteData);
      }

      if (response.data.status === 200 || response.data.status === 201) {
        alert(editMode ? "견적서가 성공적으로 수정되었습니다." : "견적서가 성공적으로 생성되었습니다.");
        navigate("/repair/list");
      }
    } catch (error) {
      console.error("견적서 저장 실패:", error);
      if (error.response?.data?.message) alert(error.response.data.message);
      else if (error.response?.status === 405)
        alert("서버에서 해당 요청 방식을 지원하지 않습니다. 관리자에게 문의하세요.");
      else alert("견적서 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm("작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?"))
      navigate(-1);
  };

  return (
    <div className={styles.customerContainer}>
      <SidebarNavigation />

      <div className={styles.tabNavigation}>
        <div className={styles.tabContainer}>
          <button className={`${styles.tabButton} ${styles.active}`}>
            {editMode ? "수리 내역 수정" : "수리 내역 작성"}
          </button>
        </div>
      </div>

      <div className={styles.sectionContainer}>
        {/* 수리 기사: 서버 자동 배정(읽기 전용) */}
        <div className={styles.technicianSection}>
          <div className={styles.technicianBox}>
            <span className={styles.technicianLabel}>수리 기사</span>
            <input
              type="text"
              className={styles.technicianName}
              value={formData.engineerName}
              readOnly
              placeholder="서버에서 자동 배정됩니다"
              style={{
                border: "none",
                background: "#f5f5f5",
                outline: "none",
                padding: "4px 8px",
              }}
            />
          </div>
        </div>

        {/* 기본 정보: 자동 채움 + 읽기 전용 */}
        <div className={styles.sectionContent}>
          <div className={styles.inputGroup}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>고객명</label>
              <input className={styles.inputControl} type="text" value={formData.customerName} readOnly />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>제품명</label>
              <input className={styles.inputControl} type="text" value={formData.productName} readOnly />
            </div>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label className={styles.inputLabel}>접수번호</label>
              <input className={styles.inputControl} type="text" value={formData.requestNo} readOnly />
            </div>
          </div>
        </div>

        {/* 프리셋 선택 */}
        <CategoryPresetPicker
          styles={styles}
          onAdd={(newItem) => setRepairItems((prev) => [...prev, newItem])}
        />

        {/* 수리 항목 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>수리 항목</h2>
          <div className={styles.repairTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>수리 항목명</div>
              <div className={styles.headerCell}>설명</div>
              <div className={styles.headerCell}>비용</div>
              <div className={styles.headerCell}>+/-</div>
            </div>

            {repairItems.map((item) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>{item.itemName}</div>
                <div className={styles.tableCell}>{item.description}</div>
                <div className={styles.tableCell}>
                  {(Number.parseInt(item.cost) || 0).toLocaleString()}원
                </div>
                <div className={styles.tableCell}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => removeRepairItem(item.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}

            {directInputItems.map((item, index) => (
              <div key={item.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  {item.isEditing ? (
                    <input
                      className={styles.tableInput}
                      type="text"
                      placeholder="항목명 입력"
                      value={item.itemName}
                      onChange={(e) =>
                        handleDirectInputChange(item.id, "itemName", e.target.value)
                      }
                    />
                  ) : (
                    item.itemName
                  )}
                </div>
                <div className={styles.tableCell}>
                  {item.isEditing ? (
                    <input
                      className={styles.tableInput}
                      type="text"
                      placeholder="설명 입력"
                      value={item.description}
                      onChange={(e) =>
                        handleDirectInputChange(item.id, "description", e.target.value)
                      }
                    />
                  ) : (
                    item.description
                  )}
                </div>
                <div className={styles.tableCell}>
                  {item.isEditing ? (
                    <input
                      className={styles.tableInput}
                      type="number"
                      placeholder="비용 입력"
                      value={item.cost}
                      onChange={(e) =>
                        handleDirectInputChange(item.id, "cost", e.target.value)
                      }
                    />
                  ) : (
                    `${(Number.parseInt(item.cost) || 0).toLocaleString()}원`
                  )}
                </div>
                <div className={styles.tableCell}>
                  {index === directInputItems.length - 1 ? (
                    <button
                      className={styles.addBtn}
                      onClick={() => {
                        if (item.isEditing) {
                          confirmDirectInputItem(item.id);
                          addDirectInputItem();
                        } else {
                          addDirectInputItem();
                        }
                      }}
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  ) : (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => removeDirectInputItem(item.id)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 견적서 정보 입력 */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>견적서 정보 입력</h2>
          <div className={styles.estimateGrid}>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>예상 총 견적금액</label>
              <input
                className={styles.fieldInput}
                type="text"
                value={estimatedCost.toLocaleString()}
                readOnly
                style={{ backgroundColor: "#f5f5f5" }}
                placeholder="200,000"
              />
              <small>* 수리 항목 비용의 합계가 자동으로 계산됩니다.</small>
            </div>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>견적서 생성일</label>
              <input
                className={styles.fieldInput}
                type="date"
                value={formData.createdDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, createdDate: e.target.value }))
                }
              />
            </div>
            <div className={styles.estimateField}>
              <label className={styles.fieldLabel}>실제 수리 비용</label>
              <input
                className={styles.fieldInput}
                type="number"
                value={actualCost}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 0;
                  setActualCost(newValue);
                  setIsActualCostManuallyEdited(true);
                }}
                placeholder="180,000"
              />
            </div>
            {/* 상태 변경 필드 제거됨 (백엔드 처리) */}
          </div>

          <div className={styles.agreementSection}>
            <span className={styles.agreementLabel}>고객 동의 여부</span>
            <div className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.customerConsent}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customerConsent: e.target.checked,
                  }))
                }
              />
              <span>동의 받음</span>
            </div>
          </div>
        </div>

        {/* 사진 첨부 */}
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>사진 첨부</h2>
          <div className={styles.fileUpload}>
            <p className={styles.fileInfo}>
              이미지 파일만 업로드 가능하며, 파일 크기는 10MB 이하로 제한됩니다.
            </p>

            <div className={styles.dropZone}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className={styles.fileInput}
                disabled={uploading || saving}
              />
              <div className={styles.dropText}>
                {uploading
                  ? "이미지 업로드 중..."
                  : "파일을 드롭하거나 클릭하여 선택"}
              </div>
              <div className={styles.formatText}>
                형식: JPG, PNG, GIF & 최대 파일 크기: 10MB
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className={styles.uploadedFiles}>
                <h4>📷 업로드된 이미지 ({uploadedImages.length}장):</h4>
                <div className={styles.imageGallery}>
                  {uploadedImages.map((image) => (
                    <div
                      key={image.imageId || image.id}
                      className={styles.imageItem}
                    >
                      <div className={styles.imagePreview}>
                        <img
                          src={
                            image.url ||
                            (image.imageId
                              ? `/api/images/view/${image.imageId}`
                              : "")
                          }
                          alt={image.fileName || image.name}
                          className={styles.previewImage}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className={styles.imagePlaceholder}
                          style={{ display: "none" }}
                        >
                          <span>이미지를 불러올 수 없습니다</span>
                        </div>
                      </div>
                      <div className={styles.imageInfo}>
                        <div
                          className={styles.imageName}
                          title={image.fileName || image.name}
                        >
                          {image.fileName || image.name}
                        </div>
                        <div className={styles.imageSize}>
                          {image.fileSize
                            ? `${(image.fileSize / 1024).toFixed(1)} KB`
                            : image.size
                            ? `${(image.size / 1024).toFixed(1)} KB`
                            : ""}
                        </div>
                      </div>
                      <button
                        className={styles.removeImageBtn}
                        onClick={() =>
                          handleDeleteImage(image.imageId || image.id)
                        }
                        title="이미지 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={handleCancel} disabled={saving || uploading}>
            취소
          </button>
          <button className={styles.submitButton} onClick={handleSubmit} disabled={saving || uploading}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairWritePage;
