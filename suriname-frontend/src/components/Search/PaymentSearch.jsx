import React, { useState, useEffect } from "react";
import SidebarNavigation from "../../components/SidebarNavigation";
import {
  getPayments,
  deletePayments,
  completePayment,
} from "../../api/payment";
import styles from "../../css/Payment/PaymentList.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PaymentListPage = () => {
  const [searchData, setSearchData] = useState({
    customerName: "",
    receptionNumber: "",
    bankName: "",
    paymentAmount: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    first: true,
    last: true,
  });
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchVisible, setSearchVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    fetchPayments();
  }, [pagination.currentPage]);

  // API 호출 함수들
  const fetchPayments = async (searchParams = null) => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        size: pagination.size,
        ...(searchParams || searchData),
      };

      // 빈 값 제거
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const data = await getPayments(params);

      setPayments(data.content || []);
      setPagination({
        currentPage: data.currentPage || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        size: data.size || 10,
        first: data.first !== false,
        last: data.last !== false,
      });
    } catch (error) {
      alert(
        `데이터 로드 실패: ${
          error.message || "알 수 없는 오류가 발생했습니다."
        }`
      );
    }
    setLoading(false);
  };

  const deleteSelectedPayments = async () => {
    if (selectedPayments.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (
      !confirm(`선택된 ${selectedPayments.length}개의 항목을 삭제하시겠습니까?`)
    ) {
      return;
    }

    try {
      await deletePayments(selectedPayments);
      alert("선택된 항목이 삭제되었습니다.");
      setSelectedPayments([]);
      setSelectAll(false);
      fetchPayments();
    } catch (error) {
      alert(
        `삭제 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`
      );
    }
  };

  const handlePaymentClick = async (payment) => {
    if (payment.depositStatus === "입금대기") {
      if (confirm("입금완료로 전환하시겠습니까?")) {
        try {
          await completePayment(payment.paymentId);
          alert("입금완료로 전환되었습니다.");
          fetchPayments();
        } catch (error) {
          alert(
            `입금완료 전환 중 오류가 발생했습니다: ${
              error.response?.data?.message ||
              error.message ||
              "알 수 없는 오류"
            }`
          );
        }
      }
    }
  };

  // 이벤트 핸들러들
  const handleInputChange = (field, value) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
    fetchPayments(searchData);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map((payment) => payment.paymentId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments((prev) => {
      if (prev.includes(paymentId)) {
        const newSelected = prev.filter((id) => id !== paymentId);
        setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prev, paymentId];
        setSelectAll(newSelected.length === payments.length);
        return newSelected;
      }
    });
  };

  const toggleSearchVisible = () => {
    setSearchVisible(!searchVisible);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";
    const date = new Date(dateTime);
    return date
      .toLocaleString("ko-KR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/\./g, "-")
      .replace(/, /g, " ");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return amount.toLocaleString("ko-KR");
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(0, pagination.currentPage - 2);
    const endPage = Math.min(
      pagination.totalPages - 1,
      pagination.currentPage + 2
    );

    if (pagination.currentPage > 0) {
      pages.push(
        <button
          key="prev"
          className="page-btn"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
        >
          &lt;
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${pagination.currentPage === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i + 1}
        </button>
      );
    }

    if (pagination.currentPage < pagination.totalPages - 1) {
      pages.push(
        <button
          key="next"
          className="page-btn"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
        >
          &gt;
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={styles.container}>
      <SidebarNavigation />

      {!searchVisible ? (
        <div className={styles.searchToggle}>
          <button
            className={styles.searchToggleBtn}
            onClick={toggleSearchVisible}
          >
            검색창 열기
          </button>
        </div>
      ) : (
        <div className={styles.searchWrap}>
          <div className={styles.searchCloseBtn}>
            <button onClick={toggleSearchVisible}>검색창 닫기 ×</button>
          </div>

          <div className={styles.searchFields}>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <label>고객명</label>
                <input
                  type="text"
                  value={searchData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                />
              </div>

              <div className={styles.searchField}>
                <label>접수번호</label>
                <input
                  type="text"
                  value={searchData.receptionNumber}
                  onChange={(e) =>
                    handleInputChange("receptionNumber", e.target.value)
                  }
                />
              </div>

              <div className={styles.searchField}>
                <label>은행이름</label>
                <input
                  type="text"
                  value={searchData.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                />
              </div>

              <div className={styles.searchField}>
                <label>입금금액</label>
                <input
                  type="text"
                  value={searchData.paymentAmount || ""}
                  onChange={(e) =>
                    handleInputChange("paymentAmount", e.target.value)
                  }
                  placeholder="금액 입력"
                />
              </div>
            </div>

            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <label>입금완료시각</label>
                <input
                  type="date"
                  value={searchData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className={styles.searchField}>
                <label>　</label>
                <input
                  type="date"
                  value={searchData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>

              <div className={styles.searchField}>
                <label>입금상태</label>
                <select
                  value={searchData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="입금완료">입금완료</option>
                  <option value="입금대기">입금대기</option>
                  <option value="입금실패">입금실패</option>
                </select>
              </div>

              <button
                className={styles.searchButton}
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "검색 중..." : "검색"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            onClick={deleteSelectedPayments}
            className={styles.deleteButton}
          >
            삭제 ({selectedPayments.length})
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            데이터를 불러오는 중...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>고객명</th>
                <th>접수번호</th>
                <th>계좌번호</th>
                <th>은행이름</th>
                <th>입금금액</th>
                <th>입금상태</th>
                <th>입금완료시각</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="9" className={styles.emptyState}>
                    <h3>데이터가 없습니다</h3>
                    <p>검색 조건을 변경하거나 새로운 결제를 등록해보세요.</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.paymentId)}
                        onChange={() => handleSelectPayment(payment.paymentId)}
                      />
                    </td>
                    <td>{payment.customerName}</td>
                    <td>{payment.receptionNumber}</td>
                    <td>{payment.virtualAccountNumber || "-"}</td>
                    <td>{payment.bankName || "-"}</td>
                    <td>{formatCurrency(payment.paymentAmount)}</td>
                    <td
                      className={
                        payment.depositStatus === "입금대기"
                          ? styles.clickableStatus
                          : ""
                      }
                      onClick={() => handlePaymentClick(payment)}
                      style={
                        payment.depositStatus === "입금대기"
                          ? { cursor: "pointer", color: "#007bff" }
                          : {}
                      }
                    >
                      {payment.depositStatus}
                    </td>
                    <td>{formatDateTime(payment.confirmedAt)}</td>
                    <td>{payment.memo || "-"}</td>
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
};

export default PaymentListPage;
