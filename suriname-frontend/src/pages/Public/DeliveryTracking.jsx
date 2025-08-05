import React, { useState } from "react";
import axios from "axios";
import { Search, Package, Truck, CheckCircle, Clock, Phone, MapPin } from "lucide-react";
import styles from "../../css/Public/DeliveryTracking.module.css";

const DeliveryTracking = () => {
  const [requestNo, setRequestNo] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!requestNo.trim()) {
      setError("접수번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`/api/public/delivery/${requestNo}`);
      
      if (response.data.status === 200) {
        setDeliveryInfo(response.data.data);
      } else {
        setError(response.data.message || "배송 정보를 찾을 수 없습니다.");
        setDeliveryInfo(null);
      }
    } catch (error) {
      console.error("배송 조회 실패:", error);
      setError("접수번호를 확인해주세요. 배송 정보를 찾을 수 없습니다.");
      setDeliveryInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "배송준비":
      case "PENDING":
        return <Clock className={styles.statusIcon} />;
      case "배송중":
      case "SHIPPED":
        return <Truck className={styles.statusIcon} />;
      case "배송완료":
      case "DELIVERED":
        return <CheckCircle className={styles.statusIcon} />;
      default:
        return <Package className={styles.statusIcon} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "배송준비":
      case "PENDING":
        return styles.statusPending;
      case "배송중":
      case "SHIPPED":
        return styles.statusShipped;
      case "배송완료":
      case "DELIVERED":
        return styles.statusDelivered;
      default:
        return styles.statusPending;
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case "PENDING":
        return "배송준비";
      case "SHIPPED":
        return "배송중";
      case "DELIVERED":
        return "배송완료";
      default:
        return status;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>배송 조회</h1>
        <p>접수번호로 배송 상태를 확인하실 수 있습니다.</p>
      </div>

      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputGroup}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="접수번호를 입력하세요 (예: REQ-20240805-001)"
              value={requestNo}
              onChange={(e) => setRequestNo(e.target.value)}
              className={styles.searchInput}
            />
            <button 
              type="submit" 
              className={styles.searchButton}
              disabled={loading}
            >
              {loading ? "조회중..." : "조회"}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>

      {deliveryInfo && (
        <div className={styles.deliveryInfo}>
          {/* 배송 상태 카드 */}
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <div className={`${styles.statusBadge} ${getStatusClass(deliveryInfo.status)}`}>
                {getStatusIcon(deliveryInfo.status)}
                <span>{getStatusDisplayName(deliveryInfo.status)}</span>
              </div>
              <div className={styles.requestInfo}>
                <span className={styles.requestNo}>접수번호: {deliveryInfo.requestNo}</span>
              </div>
            </div>
            
            {deliveryInfo.status === "DELIVERED" && deliveryInfo.completedDate && (
              <div className={styles.completionInfo}>
                <CheckCircle size={16} />
                <span>배송완료: {new Date(deliveryInfo.completedDate).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* 배송 정보 카드 */}
          <div className={styles.infoCard}>
            <h3>배송 정보</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <strong>수취인</strong>
                <span>{deliveryInfo.customerName}</span>
              </div>
              <div className={styles.infoItem}>
                <Phone size={16} />
                <span>{deliveryInfo.phone}</span>
              </div>
              <div className={styles.infoItem}>
                <MapPin size={16} />
                <span>{deliveryInfo.address}</span>
              </div>
              <div className={styles.infoItem}>
                <strong>등록일</strong>
                <span>{new Date(deliveryInfo.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* 택배 정보 카드 */}
          {deliveryInfo.carrierName && (
            <div className={styles.infoCard}>
              <h3>택배 정보</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <strong>택배사</strong>
                  <span>{deliveryInfo.carrierName}</span>
                </div>
                {deliveryInfo.trackingNo && (
                  <div className={styles.infoItem}>
                    <strong>송장번호</strong>
                    <span className={styles.trackingNo}>{deliveryInfo.trackingNo}</span>
                  </div>
                )}
              </div>
              
              {deliveryInfo.trackingNo && (
                <div className={styles.trackingActions}>
                  <button 
                    className={styles.trackingButton}
                    onClick={() => {
                      // 실제 택배사 조회 API 호출
                      axios.get(`/api/delivery/tracking?carrierName=${deliveryInfo.carrierName}&trackingNo=${deliveryInfo.trackingNo}`)
                        .then(response => {
                          if (response.data.status === 200) {
                            alert(`배송 상태: ${response.data.data.status}\n위치: ${response.data.data.location}\n메시지: ${response.data.data.message}`);
                          }
                        })
                        .catch(() => {
                          alert("택배사 조회 서비스에 일시적인 문제가 있습니다.");
                        });
                    }}
                  >
                    <Truck size={16} />
                    실시간 배송 조회
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 진행 상황 타임라인 */}
          <div className={styles.timelineCard}>
            <h3>배송 진행 상황</h3>
            <div className={styles.timeline}>
              <div className={`${styles.timelineItem} ${styles.completed}`}>
                <div className={styles.timelineIcon}>
                  <CheckCircle size={16} />
                </div>
                <div className={styles.timelineContent}>
                  <strong>배송 접수</strong>
                  <span>{new Date(deliveryInfo.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {deliveryInfo.status !== "PENDING" && (
                <div className={`${styles.timelineItem} ${styles.completed}`}>
                  <div className={styles.timelineIcon}>
                    <Truck size={16} />
                  </div>
                  <div className={styles.timelineContent}>
                    <strong>배송 시작</strong>
                    <span>택배사로 상품이 전달되었습니다.</span>
                  </div>
                </div>
              )}

              {deliveryInfo.status === "DELIVERED" && (
                <div className={`${styles.timelineItem} ${styles.completed}`}>
                  <div className={styles.timelineIcon}>
                    <CheckCircle size={16} />
                  </div>
                  <div className={styles.timelineContent}>
                    <strong>배송 완료</strong>
                    <span>{new Date(deliveryInfo.completedDate).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 고객 서비스 안내 */}
          <div className={styles.serviceInfo}>
            <h4>문의하기</h4>
            <p>배송 관련 문의사항이 있으시면 고객센터로 연락주세요.</p>
            <div className={styles.contactInfo}>
              <Phone size={16} />
              <span>고객센터: 1588-0000</span>
            </div>
          </div>
        </div>
      )}

      {!deliveryInfo && !error && !loading && (
        <div className={styles.emptyState}>
          <Package size={64} className={styles.emptyIcon} />
          <h3>배송 정보 조회</h3>
          <p>접수번호를 입력하시면 배송 상태를 확인하실 수 있습니다.</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;