import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Package, Truck, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Delivery/DeliveryList.module.css";

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
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await axios.get("/api/delivery", { params });
      
      if (response.data.status === 200) {
        setDeliveries(response.data.data.content || []);
        setTotalPages(response.data.data.totalPages || 0);
      } else {
        console.error('API 응답 오류:', response.data.message);
        setDeliveries([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("배송 목록 조회 실패:", error);
      setDeliveries([]);
      setTotalPages(0);
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
    switch (status) {
      case "배송준비":
        return styles.statusPending;
      case "배송중":
        return styles.statusShipped;
      case "배송완료":
        return styles.statusDelivered;
      default:
        return styles.statusPending;
    }
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
                        {getStatusIcon(delivery.status)}
                        {delivery.status}
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