import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../css/Request/RequestForm.module.css";
import axios from "../../api/axiosInstance";

export default function RequestEdit() {
  const { id } = useParams(); // 요청 번호
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  // 읽기 전용으로 보여줄 선택 정보들
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState(null);

  // 수정 가능한 필드
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 권한 체크 (필요 시)
  useEffect(() => {
    if (!(role === "ADMIN" || role === "STAFF")) {
      navigate("/request/list", { replace: true });
    }
  }, [role, navigate]);

  useEffect(() => {
    let alive = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/requests/${id}`);
        if (!alive) return;

        const d = res.data;
        // API 응답 키는 DTO에 맞춰서 매핑
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
          customerProductId: d.customerProductId,
        });

        setSelectedEngineer({
          id: d.employeeId,
          name: d.engineerName,
          department: d.engineerDepartment,
        });

        setContent(d.content ?? "");
      } catch (err) {
        console.error("요청 상세 정보 조회 실패:", err);
        alert("요청 상세 정보를 불러오지 못했습니다.");
        navigate("/request/list");
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      alive = false;
    };
  }, [id, navigate]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      // 내용만 PATCH
      await axios.patch(`/api/requests/${id}`, { content });
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
          {/* CSS 모듈 활성 클래스 분리 */}
          <button className={`${styles.tabButton} ${styles.tabButtonActive}`}>
            A/S 요청 수정
          </button>
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

        {/* 버튼 */}
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={saving}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
