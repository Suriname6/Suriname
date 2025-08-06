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

  // Mock 데이터 (다양한 케이스)
  const mockDeliveries = [
    // 배송완료 케이스들
    {
      deliveryId: 1,
      requestNo: "AS-20250801-001",
      customerName: "김민수",
      phone: "010-1234-5678",
      address: "서울특별시 강남구 테헤란로 123",
      carrierName: "CJ대한통운",
      trackingNo: "1234567890123",
      status: "배송완료",
      createdAt: "2025-08-01T09:30:00",
      completedDate: "2025-08-03T14:20:00"
    },
    {
      deliveryId: 2,
      requestNo: "AS-20250801-002",
      customerName: "이영희",
      phone: "010-9876-5432",
      address: "부산광역시 해운대구 센텀중앙로 456",
      carrierName: "롯데택배",
      trackingNo: "2345678901234",
      status: "배송완료",
      createdAt: "2025-08-01T14:15:00",
      completedDate: "2025-08-02T16:45:00"
    },
    {
      deliveryId: 3,
      requestNo: "AS-20250801-003",
      customerName: "박철수",
      phone: "010-5555-6666",
      address: "대구광역시 수성구 동대구로 789",
      carrierName: "한진택배",
      trackingNo: "3456789012345",
      status: "배송완료",
      createdAt: "2025-08-01T11:20:00",
      completedDate: "2025-08-04T10:30:00"
    },
    // 배송중 케이스들
    {
      deliveryId: 4,
      requestNo: "AS-20250802-001",
      customerName: "최수진",
      phone: "010-7777-8888",
      address: "인천광역시 연수구 컨벤시아대로 321",
      carrierName: "CJ대한통운",
      trackingNo: "4567890123456",
      status: "배송중",
      createdAt: "2025-08-02T08:45:00",
      completedDate: null
    },
    {
      deliveryId: 5,
      requestNo: "AS-20250802-002",
      customerName: "정하나",
      phone: "010-2222-3333",
      address: "광주광역시 서구 상무중앙로 654",
      carrierName: "우체국택배",
      trackingNo: "5678901234567",
      status: "배송중",
      createdAt: "2025-08-02T16:30:00",
      completedDate: null
    },
    {
      deliveryId: 6,
      requestNo: "AS-20250803-001",
      customerName: "강도현",
      phone: "010-4444-5555",
      address: "경기도 성남시 분당구 판교역로 987",
      carrierName: "롯데택배",
      trackingNo: "6789012345678",
      status: "배송중",
      createdAt: "2025-08-03T12:10:00",
      completedDate: null
    },
    // 배송준비 케이스들
    {
      deliveryId: 7,
      requestNo: "AS-20250804-001",
      customerName: "윤서영",
      phone: "010-6666-7777",
      address: "대전광역시 유성구 대학로 147",
      carrierName: null,
      trackingNo: null,
      status: "배송준비",
      createdAt: "2025-08-04T09:20:00",
      completedDate: null
    },
    {
      deliveryId: 8,
      requestNo: "AS-20250804-002",
      customerName: "임지훈",
      phone: "010-8888-9999",
      address: "울산광역시 남구 삼산로 258",
      carrierName: null,
      trackingNo: null,
      status: "배송준비",
      createdAt: "2025-08-04T15:45:00",
      completedDate: null
    },
    {
      deliveryId: 9,
      requestNo: "AS-20250805-001",
      customerName: "송미라",
      phone: "010-1111-2222",
      address: "경기도 수원시 영통구 월드컵로 369",
      carrierName: null,
      trackingNo: null,
      status: "배송준비",
      createdAt: "2025-08-05T10:30:00",
      completedDate: null
    },
    // 추가 다양한 케이스들
    {
      deliveryId: 10,
      requestNo: "AS-20250805-002",
      customerName: "오현수",
      phone: "010-3333-4444",
      address: "제주특별자치도 제주시 중앙로 741",
      carrierName: "한진택배",
      trackingNo: "7890123456789",
      status: "배송중",
      createdAt: "2025-08-05T13:15:00",
      completedDate: null
    },
    {
      deliveryId: 11,
      requestNo: "AS-20250805-003",
      customerName: "한예슬",
      phone: "010-9999-0000",
      address: "강원도 춘천시 중앙로 852",
      carrierName: "CJ대한통운",
      trackingNo: "8901234567890",
      status: "배송완료",
      createdAt: "2025-08-05T08:00:00",
      completedDate: "2025-08-06T11:30:00"
    },
    {
      deliveryId: 12,
      requestNo: "AS-20250806-001",
      customerName: "신동욱",
      phone: "010-5555-7777",
      address: "충청북도 청주시 상당구 상당로 963",
      carrierName: null,
      trackingNo: null,
      status: "배송준비",
      createdAt: "2025-08-06T07:45:00",
      completedDate: null
    },
    // 긴 주소 케이스
    {
      deliveryId: 13,
      requestNo: "AS-20250806-002",
      customerName: "조민정",
      phone: "010-7777-1111",
      address: "경상남도 창원시 의창구 창원대로 159번길 20, 3층 301호 (우편번호: 51140)",
      carrierName: "롯데택배",
      trackingNo: "9012345678901",
      status: "배송중",
      createdAt: "2025-08-06T14:20:00",
      completedDate: null
    },
    // 오늘 등록된 케이스
    {
      deliveryId: 14,
      requestNo: "AS-20250806-003",
      customerName: "배성호",
      phone: "010-2222-8888",
      address: "전라북도 전주시 완산구 전주천동로 456",
      carrierName: "우체국택배",
      trackingNo: "0123456789012",
      status: "배송중",
      createdAt: "2025-08-06T16:00:00",
      completedDate: null
    },
    {
      deliveryId: 15,
      requestNo: "AS-20250806-004",
      customerName: "문지은",
      phone: "010-6666-3333",
      address: "충청남도 천안시 동남구 천안대로 789",
      carrierName: null,
      trackingNo: null,
      status: "배송준비",
      createdAt: "2025-08-06T17:30:00",
      completedDate: null
    }
  ];

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
        setDeliveries(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
      } catch (apiError) {
        console.log("API 호출 실패, 샘플 데이터로 표시:", apiError);
        
        // Mock 데이터 필터링 및 페이지네이션
        let filteredData = mockDeliveries;
        
        // 상태 필터링
        if (statusFilter) {
          const statusMap = {
            "PENDING": "배송준비",
            "SHIPPED": "배송중", 
            "DELIVERED": "배송완료"
          };
          filteredData = mockDeliveries.filter(delivery => 
            delivery.status === statusMap[statusFilter]
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