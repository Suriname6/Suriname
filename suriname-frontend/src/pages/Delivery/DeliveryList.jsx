import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Package, Truck, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Delivery/DeliveryList.module.css";
import { mockDeliveries, filterDeliveriesByStatus } from "../../utils/mockData";
import { handleDeliveryListError } from "../../utils/errorHandler";
import { DELIVERY_STATUS, DELIVERY_STATUS_REVERSE, DELIVERY_STATUS_CLASSES } from "../../utils/constants";

const DeliveryList = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDeliveries();
  }, [currentPage, statusFilter]);


  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      // 실제 API 호출 시도 후 실패하면 Mock 데이터 사용
      try {
        const params = {
          page: currentPage - 1,
          size: itemsPerPage,
        };
        
        if (statusFilter) {
          params.status = statusFilter;
        }

        const response = await axios.get("/api/delivery", { params });
        
        // API 응답 데이터 처리
        if (response.data.status === 200) {
          // Backend 상태를 Frontend 표시용으로 변환
          const processedDeliveries = response.data.data.content.map(delivery => ({
            ...delivery,
            statusDisplay: DELIVERY_STATUS[delivery.status] || delivery.status
          }));
          
          setDeliveries(processedDeliveries);
          setTotalPages(response.data.data.totalPages);
        } else {
          throw new Error(response.data.message || "데이터 로드 실패");
        }
      } catch (apiError) {
        console.log("API 호출 실패, 샘플 데이터로 표시:", apiError);
        
        // Mock 데이터 필터링 및 페이지네이션
        let filteredData = mockDeliveries;
        
        // 상태 필터링 (표준화된 매핑 사용)
        if (statusFilter) {
          filteredData = mockDeliveries.filter(delivery => 
            delivery.status === DELIVERY_STATUS[statusFilter]
          );
        }
        
        // 페이지네이션
        const totalItems = filteredData.length;
        const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);
        
        setDeliveries(pageData);
        setTotalPages(totalPagesCount);
      }
    } catch (error) {
      console.error("배송 목록 조회 실패:", error);
      alert("배송 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "배송준비":
        return <Package className={styles.statusIcon} />;
      case "배송중":
        return <Truck className={styles.statusIcon} />;
      case "배송완료":
        return <CheckCircle className={styles.statusIcon} />;
      default:
        return <Package className={styles.statusIcon} />;
    }
  };

  const getStatusClass = (status) => {
    // status가 Backend enum이면 변환, 한글이면 그대로 사용
    const displayStatus = DELIVERY_STATUS[status] || status;
    const statusKey = DELIVERY_STATUS_REVERSE[displayStatus] || 'PENDING';
    return styles[DELIVERY_STATUS_CLASSES[statusKey]];
  };

  const handleDeliveryDetail = (deliveryId) => {
    navigate(`/delivery/detail/${deliveryId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>배송 관리</h1>
        <button 
          className={styles.addButton}
          onClick={() => navigate("/delivery/register")}
        >
          배송 등록
        </button>
      </div>

      {/* 상태 필터 */}
      <div className={styles.filterContainer}>
        <button
          className={`${styles.filterButton} ${!statusFilter ? styles.active : ""}`}
          onClick={() => handleStatusFilter("")}
        >
          전체
        </button>
        <button
          className={`${styles.filterButton} ${statusFilter === "PENDING" ? styles.active : ""}`}
          onClick={() => handleStatusFilter("PENDING")}
        >
          배송준비
        </button>
        <button
          className={`${styles.filterButton} ${statusFilter === "SHIPPED" ? styles.active : ""}`}
          onClick={() => handleStatusFilter("SHIPPED")}
        >
          배송중
        </button>
        <button
          className={`${styles.filterButton} ${statusFilter === "DELIVERED" ? styles.active : ""}`}
          onClick={() => handleStatusFilter("DELIVERED")}
        >
          배송완료
        </button>
      </div>

      {/* 배송 목록 테이블 */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>접수번호</th>
                <th>고객명</th>
                <th>연락처</th>
                <th>주소</th>
                <th>택배사</th>
                <th>송장번호</th>
                <th>상태</th>
                <th>등록일</th>
                <th>완료일</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.length > 0 ? (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery.deliveryId}
                    className={styles.tableRow}
                    onClick={() => handleDeliveryDetail(delivery.deliveryId)}
                  >
                    <td>{delivery.requestNo}</td>
                    <td>{delivery.customerName}</td>
                    <td>{delivery.phone}</td>
                    <td className={styles.addressCell}>{delivery.address}</td>
                    <td>{delivery.carrierName || "-"}</td>
                    <td>{delivery.trackingNo || "-"}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(delivery.status)}`}>
                        {getStatusIcon(delivery.statusDisplay || delivery.status)}
                        {delivery.statusDisplay || delivery.status}
                      </span>
                    </td>
                    <td>{new Date(delivery.createdAt).toLocaleDateString()}</td>
                    <td>
                      {delivery.completedDate 
                        ? new Date(delivery.completedDate).toLocaleDateString() 
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className={styles.noData}>
                    배송 정보가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ""}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryList;