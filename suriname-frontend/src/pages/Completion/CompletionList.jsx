import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, User, Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/Completion/CompletionList.module.css";

const CompletionList = () => {
  const [completions, setCompletions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCompletions();
  }, [currentPage, typeFilter, statusFilter]);

  const fetchCompletions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
      };
      
      if (typeFilter) {
        params.type = typeFilter;
      }

      let endpoint = "/api/completion";
      if (statusFilter === "incomplete") {
        endpoint = "/api/completion/incomplete";
      }

      const response = await axios.get(endpoint, { params });
      setCompletions(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("완료 목록 조회 실패:", error);
      alert("완료 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "type") {
      setTypeFilter(value);
    } else if (filterType === "status") {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const handleCompletionDetail = (completionId) => {
    navigate(`/completion/detail/${completionId}`);
  };

  const handleReceivedConfirm = async (completionId) => {
    try {
      await axios.put(`/api/completion/${completionId}/received`);
      alert("고객 수령이 확인되었습니다.");
      fetchCompletions();
    } catch (error) {
      console.error("수령 확인 실패:", error);
      alert("수령 확인에 실패했습니다.");
    }
  };

  const handleSatisfactionRequest = async (completionId) => {
    try {
      await axios.put(`/api/completion/${completionId}/satisfaction`);
      alert("만족도 조사가 요청되었습니다.");
      fetchCompletions();
    } catch (error) {
      console.error("만족도 조사 요청 실패:", error);
      alert("만족도 조사 요청에 실패했습니다.");
    }
  };

  const getCompletionTypeColor = (type) => {
    switch (type) {
      case "수리 완료":
        return styles.typeRepair;
      case "교체 완료":
        return styles.typeExchange;
      case "환불 완료":
        return styles.typeRefund;
      case "반품 완료":
        return styles.typeReturn;
      case "점검 완료":
        return styles.typeInspection;
      default:
        return styles.typeDefault;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>완료 처리 관리</h1>
        <button 
          className={styles.addButton}
          onClick={() => navigate("/completion/register")}
        >
          <Plus size={16} />
          완료 처리 등록
        </button>
      </div>

      {/* 필터 컨테이너 */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label>완료 타입:</label>
          <button
            className={`${styles.filterButton} ${!typeFilter ? styles.active : ""}`}
            onClick={() => handleFilterChange("type", "")}
          >
            전체
          </button>
          <button
            className={`${styles.filterButton} ${typeFilter === "REPAIR_COMPLETED" ? styles.active : ""}`}
            onClick={() => handleFilterChange("type", "REPAIR_COMPLETED")}
          >
            수리 완료
          </button>
          <button
            className={`${styles.filterButton} ${typeFilter === "EXCHANGE_COMPLETED" ? styles.active : ""}`}
            onClick={() => handleFilterChange("type", "EXCHANGE_COMPLETED")}
          >
            교체 완료
          </button>
          <button
            className={`${styles.filterButton} ${typeFilter === "REFUND_COMPLETED" ? styles.active : ""}`}
            onClick={() => handleFilterChange("type", "REFUND_COMPLETED")}
          >
            환불 완료
          </button>
        </div>

        <div className={styles.filterGroup}>
          <label>처리 상태:</label>
          <button
            className={`${styles.filterButton} ${!statusFilter ? styles.active : ""}`}
            onClick={() => handleFilterChange("status", "")}
          >
            전체
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === "incomplete" ? styles.active : ""}`}
            onClick={() => handleFilterChange("status", "incomplete")}
          >
            미완료
          </button>
        </div>
      </div>

      {/* 완료 목록 테이블 */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>접수번호</th>
                <th>고객명</th>
                <th>완료 타입</th>
                <th>담당자</th>
                <th>고객 수령</th>
                <th>만족도 조사</th>
                <th>완료일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {completions.length > 0 ? (
                completions.map((completion) => (
                  <tr
                    key={completion.completionId}
                    className={styles.tableRow}
                  >
                    <td 
                      className={styles.requestNo}
                      onClick={() => handleCompletionDetail(completion.completionId)}
                    >
                      {completion.requestNo}
                    </td>
                    <td>{completion.customerName}</td>
                    <td>
                      <span className={`${styles.typeBadge} ${getCompletionTypeColor(completion.completionType)}`}>
                        {completion.completionType}
                      </span>
                    </td>
                    <td>{completion.completedBy}</td>
                    <td>
                      <div className={styles.statusCell}>
                        {completion.customerReceived ? (
                          <span className={styles.statusCompleted}>
                            <CheckCircle size={14} />
                            수령 완료
                          </span>
                        ) : (
                          <button
                            className={styles.statusButton}
                            onClick={() => handleReceivedConfirm(completion.completionId)}
                          >
                            <Clock size={14} />
                            수령 확인
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        {completion.satisfactionRequested ? (
                          <span className={styles.statusCompleted}>
                            <CheckCircle size={14} />
                            요청 완료
                          </span>
                        ) : (
                          <button
                            className={styles.statusButton}
                            onClick={() => handleSatisfactionRequest(completion.completionId)}
                          >
                            <Clock size={14} />
                            요청하기
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {completion.receivedDate 
                        ? new Date(completion.receivedDate).toLocaleDateString()
                        : new Date(completion.createdAt).toLocaleDateString()
                      }
                    </td>
                    <td>
                      <button
                        className={styles.detailButton}
                        onClick={() => handleCompletionDetail(completion.completionId)}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    완료 처리 정보가 없습니다.
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

export default CompletionList;