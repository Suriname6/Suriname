import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import styles from "../../css/Delivery/DeliveryDetail.module.css";
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react";

const STATUS_CLASS = {
  "배송준비": "statusPending",
  "배송중": "statusShipped",
  "배송완료": "statusDelivered",
};

const STATUS_ICON = {
  "배송준비": Package,
  "배송중": Truck,
  "배송완료": CheckCircle,
};

function StatusBadge({ status }) {
  const Icon = STATUS_ICON[status] ?? Package;
  const classKey = STATUS_CLASS[status] ?? "statusPending";
  return (
    <span className={`${styles.statusBadge} ${styles[classKey]}`}>
      <Icon className={styles.statusIcon} />
      {status}
    </span>
  );
}

function LabeledRow({ label, children, mono = false }) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${mono ? styles.mono : ""}`}>{children}</div>
    </div>
  );
}

function fmtDateTime(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return "-"; }
}

export default function DeliveryDetail() {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get(`/api/delivery/${deliveryId}`);
        if (res.data?.status === 200) {
          setDetail(res.data.data);
        } else {
          setErr(res.data?.message || "알 수 없는 오류");
        }
      } catch (e) {
        console.error(e);
        setErr("배송 상세 조회에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [deliveryId]);

  const title = useMemo(() => `배송 상세 #${deliveryId}`, [deliveryId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft /></button>
          <h1>{title}</h1>
        </div>
        <div className={styles.skeleton}>불러오는 중…</div>
      </div>
    );
  }

  if (err || !detail) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft /></button>
          <h1>{title}</h1>
        </div>
        <div className={styles.error}>{err || "데이터가 없습니다."}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 상단 */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft /></button>
        <h1>{title}</h1>
        <div className={styles.headerRight}>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {/* 기본 정보 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>기본 정보</h2>
        <div className={styles.grid2}>
          <LabeledRow label="배송 ID">{detail.deliveryId}</LabeledRow>
          <LabeledRow label="접수번호" mono>{detail.requestNo}</LabeledRow>
          <LabeledRow label="등록일">{fmtDateTime(detail.createdAt)}</LabeledRow>
          <LabeledRow label="수정일">{fmtDateTime(detail.updatedAt)}</LabeledRow>
          <LabeledRow label="완료일">{fmtDateTime(detail.completedDate)}</LabeledRow>
        </div>
      </section>

      {/* 고객/수령인 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>고객 / 수령인</h2>
        <div className={styles.grid2}>
          <LabeledRow label="고객명">{detail.customerName || "-"}</LabeledRow>
          <LabeledRow label="고객 연락처" mono>{detail.customerPhone || "-"}</LabeledRow>
          <LabeledRow label="수령인">{detail.name || "-"}</LabeledRow>
          <LabeledRow label="수령인 연락처" mono>{detail.phone || "-"}</LabeledRow>
          <LabeledRow label="우편번호" mono>{detail.zipcode || "-"}</LabeledRow>
          <LabeledRow label="주소">{detail.address || "-"}</LabeledRow>
        </div>
      </section>

      {/* A/S 접수 정보 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>A/S 접수 정보</h2>
        <div className={styles.grid2}>
          <LabeledRow label="제품명">{detail.productName || "-"}</LabeledRow>
          <LabeledRow label="요청 내용">
            {detail.requestContent ? <pre className={styles.pre}>{detail.requestContent}</pre> : "-"}
          </LabeledRow>
        </div>
      </section>

      {/* 배송 정보 */}
      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>배송 정보</h2>
        <div className={styles.grid2}>
          <LabeledRow label="택배사">{detail.carrierName || "-"}</LabeledRow>
          <LabeledRow label="송장번호" mono>{detail.trackingNo || "-"}</LabeledRow>
        </div>
      </section>
    </div>
  );
}
