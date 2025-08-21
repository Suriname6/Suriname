import React, { useCallback, useMemo, useEffect, useState } from "react";
import axios from "../../api/axiosInstance";
import styles from "../../css/Request/RequestList.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatusBadge from "../../components/Request/StatusBadge";
import RequestSearch from "../../components/Search/RequestSearch";

export default function RequestList() {
  const [requests, setRequests] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    first: true,
    last: true,
  });

  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("role") || "ADMIN");
  const lockedFilters = useMemo(() => ({ status: "REPAIRING" }), []);

  const toggleSearchVisible = useCallback(() => {
    setSearchVisible((v) => !v);
  }, []);

  const deleteSelectedRequests = async () => {
    if (selectedRequests.length === 0) {
      alert("선택된 항목이 없습니다.");
      return;
    }
    if (
      !window.confirm(
        `선택된 ${selectedRequests.length}개 항목을 삭제하시겠습니까?`
      )
    )
      return;
    try {
      setLoading(true);
      await axios.delete("/api/requests", { data: { ids: selectedRequests } });
      alert("선택된 항목이 삭제되었습니다.");
      setSelectedRequests([]);
      setSelectAll(false);
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error("Error deleting Requests:", error);
      alert(
        `삭제 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map((r) => r.requestId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests((prev) => {
      if (prev.includes(requestId)) {
        const next = prev.filter((id) => id !== requestId);
        setSelectAll(false);
        return next;
      } else {
        const next = [...prev, requestId];
        setSelectAll(next.length === requests.length);
        return next;
      }
    });
  };

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className={styles.container}>
      {!searchVisible ? (
        <div className={styles.searchToggle}>
          <button
            className={styles.searchToggleBtn}
            onClick={toggleSearchVisible}
          >
            검색 조건
          </button>
        </div>
      ) : (
        <RequestSearch
          requests={requests}
          setRequests={setRequests}
          pagination={pagination}
          setPagination={setPagination}
          lockedFilters={lockedFilters}
        />
      )}

      {(role === "ADMIN" || role === "STAFF") && (
        <div className={styles.tableHeader}>
          <div>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            <span>전체 선택</span>
          </div>
          <div className={styles.deleteButtonWrapper}>
            <button
              onClick={deleteSelectedRequests}
              className={styles.deleteButton}
            >
              삭제
            </button>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            데이터를 불러오는 중...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                {(role === "ADMIN" || role === "STAFF") && (
                  <th className={styles.narrowTh}></th>
                )}
                <th>접수번호</th>
                <th>고객명</th>
                <th>제품명</th>
                <th>제품모델코드</th>
                <th>접수일자</th>
                <th>상태</th>
                <th>수리 담당자</th>
                <th>상세 페이지</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "ENGINEER" ? 10 : 9}
                    className={styles.emptyState}
                  >
                    <h3>데이터가 없습니다</h3>
                    <p>검색 조건에 맞는 수리 내역이 접수되지 않았습니다.</p>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.requestId}>
                    {(role === "ADMIN" || role === "STAFF") && (
                      <td className={styles.narrowTd}>
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.requestId)}
                          onChange={() =>
                            handleSelectRequest(request.requestId)
                          }
                        />
                      </td>
                    )}
                    <td>{request.requestNo}</td>
                    <td>{request.customerName}</td>
                    <td>{request.productName}</td>
                    <td>{request.modelCode}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>
                      <StatusBadge role={role} status={request.status} />
                    </td>
                    <td>{request.engineerName}</td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(`/request/${request.requestId}`)
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #e5e7eb",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() =>
            handlePageChange(Math.max(0, pagination.currentPage - 1))
          }
          disabled={pagination.currentPage === 0}
        >
          <ChevronLeft />
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={pagination.currentPage === i ? styles.activePage : ""}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() =>
            handlePageChange(
              Math.min(pagination.totalPages - 1, pagination.currentPage + 1)
            )
          }
          disabled={pagination.currentPage === pagination.totalPages - 1}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
