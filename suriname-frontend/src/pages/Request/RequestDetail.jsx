import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import StatusBadge from "../../components/Request/StatusBadge";
import styles from "../../css/Request/RequestDetail.module.css";

// 요청 상태 한글 매핑 (enum Status)
const REQUEST_STATUS_LABELS = {
  RECEIVED: "접수",
  REPAIRING: "수리중",
  WAITING_FOR_PAYMENT: "입금대기",
  WAITING_FOR_DELIVERY: "배송대기",
  COMPLETED: "완료",
};

function getRequestStatusLabel(status) {
  return REQUEST_STATUS_LABELS?.[status] ?? status ?? "-";
}

function formatDateTime(d) {
  if (!d) return "-";
  try {
    const date = new Date(d);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState("");
  const [engineerOptions, setEngineerOptions] = useState([]);
  const [engLoading, setEngLoading] = useState(false);
  const [engError, setEngError] = useState(null);

  const [busy, setBusy] = useState(false);
  const [role] = useState(localStorage.getItem("role") || "ADMIN");

  const { assignmentStatus, rejectionReason } = detail || {};

  // 상세 조회
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setError(null);
        const res = await axios.get(`/api/requests/${id}`);
        setDetail(res.data);
      } catch (err) {
        console.error("요청 상세 정보 조회 실패:", err);
        setError("요청 상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const refetch = async () => {
    try {
      const res = await axios.get(`/api/requests/${id}`);
      setDetail(res.data);
    } catch (err) {
      console.error("재조회 실패", err);
    }
  };

  // 엔지니어 목록
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setEngLoading(true);
        setEngError(null);
        const res = await axios.get("/api/users/engineers", { params: { page: 0, size: 100 } });
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
            department: e.department,
          }))
          .filter((e) => e.id != null);
        setEngineerOptions(mapped);
      } catch (err) {
        console.error("엔지니어 목록 조회 실패:", err);
        setEngError("담당자 목록을 불러오지 못했습니다.");
      } finally {
        setEngLoading(false);
      }
    };
    fetchEngineers();
  }, []);

  const updateAssignmentStatus = async (requestId, status, reason = "") => {
    try {
      setBusy(true);
      await axios.put(`/api/requests/${requestId}/assignment-status`, { status, reason });
      await refetch();
      setShowRejectModal(false);
      setRejectReason("");
      alert("상태가 변경되었습니다.");
    } catch (err) {
      console.error("상태 변경 실패", err);
      alert("상태 변경에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  // 재배정
  const reassignEngineer = async () => {
    if (!String(selectedEngineerId).trim()) {
      alert("담당자를 선택하세요.");
      return;
    }
    try {
      setBusy(true);
      await axios.put(`/api/requests/${id}/assignment-engineer`, {
        employeeId: selectedEngineerId,
      });
      alert("기사가 재배정되었습니다.");
      window.location.reload();
    } catch (err) {
      console.error("기사 재배정 실패", err);
      alert("재배정에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  // 모달 열 때 기본값
  const openReassign = () => {
    const currentById = detail?.engineerId;
    const idFromName = engineerOptions.find((e) => e.name === detail?.engineerName)?.id ?? "";
    setSelectedEngineerId(String(currentById || idFromName || ""));
    setShowReassignModal(true);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardBody}>불러오는 중…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.titleSm}>불러오기 실패</div>
            <div className={styles.textMuted}>{error}</div>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => navigate("/request/list")}>
              목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.titleSm}>데이터 없음</div>
            <div className={styles.textMuted}>요청 데이터를 찾을 수 없어요.</div>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => navigate("/request/list")}>
              목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>요청 상세</h1>
          <p className={styles.headerMeta}>접수번호 {detail.requestNo}</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.metaLabel}>상태</div>
          <div className={styles.headerStatusRow}>
            <span className={styles.statusChip}>{getRequestStatusLabel(detail.status)}</span>
            {assignmentStatus && <StatusBadge role={role} status={assignmentStatus} />}
          </div>
        </div>
      </div>

      {/* Meta pills */}
      <div className={styles.metaRow}>
        {assignmentStatus === "REJECTED" && rejectionReason && (
          <div className={`${styles.metaPill} ${styles.metaPillDanger}`}>
            <span className={styles.metaPillLabel}>거절 사유</span>
            <span className={styles.metaPillValue}>{rejectionReason}</span>
          </div>
        )}
        <div className={styles.metaPill}>
          <span className={styles.metaPillLabel}>접수일자</span>
          <span className={styles.metaPillValue}>{formatDateTime(detail.createdAt)}</span>
        </div>
        <div className={styles.metaPill}>
          <span className={styles.metaPillLabel}>접수 변경일자</span>
          <span className={styles.metaPillValue}>{formatDateTime(detail.assignmentStatusChangedAt)}</span>
        </div>
      </div>

      {/* 카드 */}
      <div className={styles.card}>
        <div className={`${styles.cardBody} ${styles.gridTwoCol}`}>

          {/* 고객 정보 (좌측) */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>👤</span>
              <span className={styles.sectionTitle}>고객 정보</span>
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.row}>
                <div className={styles.rowKey}>고객명</div>
                <div className={styles.rowVal}>{detail.customerName ?? "-"}</div>
              </div>
              <div className={styles.row}>
                <div className={styles.rowKey}>휴대폰</div>
                <div className={styles.rowVal}>{detail.customerPhone ?? "-"}</div>
              </div>
              <div className={styles.row}>
                <div className={styles.rowKey}>생년월일</div>
                <div className={styles.rowVal}>{detail.customerBirth ?? "-"}</div>
              </div>
            </div>
          </div>

          {/* 담당자 / 배정 (우측) — 같은 행에 배치 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🛠️</span>
              <span className={styles.sectionTitle}>담당자 / 배정</span>
            </div>
            <div className={`${styles.sectionBody} ${styles.gridTwoColInner}`}>
              <div>
                <div className={styles.row}>
                  <div className={styles.rowKey}>접수 담당자</div>
                  <div className={styles.rowVal}>{detail.receiverName ?? "-"}</div>
                </div>
                <div className={styles.row}>
                  <div className={styles.rowKey}>수리 담당자</div>
                  <div className={styles.rowVal}>{detail.engineerName ?? "-"}</div>
                </div>
              </div>
              <div>
                <div className={styles.row}>
                  <div className={styles.rowKey}>연락처</div>
                  <div className={`${styles.rowVal} ${styles.noWrap}`} title={detail.receiverPhone ?? "-"}>
                    {detail.receiverPhone ?? "-"}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.rowKey}>연락처</div>
                  <div className={`${styles.rowVal} ${styles.noWrap}`} title={detail.engineerPhone ?? "-"}>
                    {detail.engineerPhone ?? "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* 고객 제품 정보 — 전체 폭 */}
        <div className={`${styles.section} ${styles.gridFull}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📦</span>
            <span className={styles.sectionTitle}>고객 제품 정보</span>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.badgeRow}>
              {detail.categoryName && <span className={styles.badge}>{detail.categoryName}</span>}
              {detail.productBrand && <span className={styles.badge}>{detail.productBrand}</span>}
            </div>

            {/* ✅ 2열 그리드로 필드 배치 */}
            <div className={styles.kvGrid}>
              <div className={styles.kv}>
                <div className={styles.rowKey}>제품명</div>
                <div className={styles.rowVal}>{detail.productName ?? "-"}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.rowKey}>모델명</div>
                <div className={styles.rowVal}>{detail.serialNumber ?? "-"}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.rowKey}>제품고유번호</div>
                <div className={styles.rowVal}>{detail.modelCode ?? "-"}</div>
              </div>
              <div className={styles.kv}>
                <div className={styles.rowKey}>제품 시리얼 번호</div>
                <div className={styles.rowVal}>{detail.serialNumber ?? "-"}</div>
              </div>
            </div>
          </div>
        </div>


          {/* 요청 내용 — 전체 */}
          <div className={`${styles.section} ${styles.gridFull}`}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📝</span>
              <span className={styles.sectionTitle}>요청 내용</span>
            </div>
            <div className={styles.sectionBody}>
              {detail.symptomTags?.length > 0 && (
                <div className={styles.tagRow}>
                  {detail.symptomTags.map((t, i) => (
                    <span key={i} className={styles.smallTag}>{t}</span>
                  ))}
                </div>
              )}
              <div className={styles.contentBox}>{detail.content}</div>
            </div>
          </div>

          {/* 첨부 이미지 — 전체 */}
          {Array.isArray(detail.requestImages) && detail.requestImages.length > 0 && (
            <div className={`${styles.section} ${styles.gridFull}`}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>🖼️</span>
                <span className={styles.sectionTitle}>첨부 이미지</span>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.imagesGrid}>
                  {detail.requestImages.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noreferrer" className={styles.imageLink}>
                      <img src={src} alt={`req-img-${i}`} className={styles.imageThumb} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>


      {/* Actions */}
      <div className={styles.stickyActions}>
        <div className={styles.buttonGroup}>
          {assignmentStatus === "PENDING" && role === "ENGINEER" && (
            <>
              <button
                className={`${styles.btn} ${styles.btnSuccess}`}
                onClick={() => updateAssignmentStatus(id, "ACCEPTED")}
                disabled={busy}
              >
                접수 확인
              </button>
              <button
                className={`${styles.btn} ${styles.btnDangerOutline}`}
                onClick={() => setShowRejectModal(true)}
                disabled={busy}
              >
                접수 불가
              </button>
            </>
          )}

          {["REJECTED", "CANCELLED", "EXPIRED"].includes(assignmentStatus) &&
            (role === "ADMIN" || role === "STAFF") && (
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={openReassign}
                disabled={busy}
              >
                담당자 재배정
              </button>
            )}
        </div>

        <div className={styles.buttonGroup}>
          {(assignmentStatus === "PENDING" || assignmentStatus === "REJECTED") &&
            (role === "ADMIN" || role === "STAFF") && (
              <>
                <button
                  className={`${styles.btn} ${styles.btnWarning}`}
                  onClick={() => navigate(`/request/edit/${id}`)}
                  disabled={busy}
                >
                  수정
                </button>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={async () => {
                    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
                    if (!confirmDelete) return;
                    try {
                      setBusy(true);
                      await axios.delete(`/api/requests/${id}`);
                      alert("삭제되었습니다.");
                      navigate("/request/list");
                    } catch (err) {
                      console.error("삭제 실패", err);
                      alert("삭제에 실패했습니다.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                  disabled={busy}
                >
                  삭제
                </button>
              </>
            )}

          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => navigate("/request/list")}>
            목록
          </button>
        </div>
      </div>

      {/* 거절 모달 */}
      {showRejectModal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => { setShowRejectModal(false); setRejectReason(""); }} />
          <div className={styles.modalContainer}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>거절 사유 입력</h3>
                <button className={styles.modalClose} onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>✕</button>
              </div>
              <div className={styles.modalBody}>
                <textarea
                  className={styles.textarea}
                  placeholder="거절 사유를 입력하세요"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className={styles.modalFooter}>
                  <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>
                    취소
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={() => {
                      if (rejectReason.trim()) updateAssignmentStatus(id, "REJECTED", rejectReason);
                      else alert("거절 사유를 입력해주세요.");
                    }}
                    disabled={busy}
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 재배정 모달 */}
      {showReassignModal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => { setShowReassignModal(false); setSelectedEngineerId(""); }} />
          <div className={styles.modalContainer}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>기사 재배정</h3>
                <button className={styles.modalClose} onClick={() => { setShowReassignModal(false); setSelectedEngineerId(""); }}>✕</button>
              </div>
              <div className={styles.modalBody}>
                {engLoading ? (
                  <div className={styles.noticeBox}>불러오는 중…</div>
                ) : engError ? (
                  <div className={`${styles.noticeBox} ${styles.noticeDanger}`}>{engError}</div>
                ) : (
                  <>
                    <label className={styles.label}>수리 담당자</label>
                    <select
                      className={styles.select}
                      value={String(selectedEngineerId ?? "")}
                      onChange={(e) => setSelectedEngineerId(e.target.value)}
                    >
                      <option value="" disabled>
                        {engineerOptions.length ? "담당자를 선택하세요" : "등록된 담당자가 없습니다"}
                      </option>
                      {engineerOptions.map((eng) => (
                        <option key={eng.id} value={String(eng.id)}>
                          {eng.name}{eng.department ? ` (${eng.department})` : ""}
                        </option>
                      ))}
                    </select>

                    <div className={styles.modalFooter}>
                      <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setShowReassignModal(false); setSelectedEngineerId(""); }}>
                        취소
                      </button>
                      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={reassignEngineer} disabled={busy || !selectedEngineerId}>
                        확인
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
