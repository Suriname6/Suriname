import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarNavigation from "../../components/SidebarNavigation";
import { getQuotes, deleteQuotes } from "../../api/quote";
import styles from "../../css/Repair/RepairList.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RepairSearch from "../../components/Search/RepairSearch.jsx";

const RepairListPage = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    customerName: "",
    requestNo: "",
    productName: "",
    serialNumber: "",
    paymentStatus: "",
    progressStatus: "",
    employeeName: "",
    startDate: "",
    endDate: "",
  });

  const [quotes, setQuotes] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    first: true,
    last: true,
  });
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchVisible, setSearchVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchQuotes();
  }, []);

  // API 호출 함수들
  const fetchQuotes = async (searchParams = null) => {
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

      const data = await getQuotes(params);

      if (!data) {
        throw new Error("서버에서 데이터를 받지 못했습니다");
      }

      setQuotes(data.content || []);
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

  const deleteSelectedQuotes = async () => {
    if (selectedQuotes.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    if (
      !confirm(`선택된 ${selectedQuotes.length}개의 항목을 삭제하시겠습니까?`)
    ) {
      return;
    }

    try {
      await deleteQuotes(selectedQuotes);
      alert("선택된 항목이 삭제되었습니다.");
      setSelectedQuotes([]);
      setSelectAll(false);
      fetchQuotes();
    } catch (error) {
      alert(
        `삭제 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`
      );
    }
  };

  // 검색 입력 처리
  const handleInputChange = (field, value) => {
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
    fetchQuotes(searchData);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(quotes.map((quote) => quote.quoteId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectQuote = (quoteId) => {
    setSelectedQuotes((prev) => {
      if (prev.includes(quoteId)) {
        const newSelected = prev.filter((id) => id !== quoteId);
        setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prev, quoteId];
        setSelectAll(newSelected.length === quotes.length);
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
      })
      .replace(/\./g, "-")
      .replace(/, /g, " ");
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return amount.toLocaleString("ko-KR");
  };

  const formatStatus = (status) => {
    if (!status) return "수리중";

    const statusMap = {
      RECEIVED: "접수",
      IN_PROGRESS: "수리중",
      AWAITING_PAYMENT: "입금 대기",
      // READY_FOR_DELIVERY: "수리완료",
      // COMPLETED: "수리완료",
      READY_FOR_DELIVERY: "배송 대기",
      COMPLETED: "배송 완료",
    };

    return statusMap[status] || status;
  };

  const getPaymentStatus = (quote) => {
    // statusChange를 기반으로 입금상태 결정
    if (quote.statusChange === "AWAITING_PAYMENT") {
      // 입금대기 상태에서 가상계좌가 발급된 경우 구분
      if (quote.paymentStatus === "입금대기") {
        return "VIRTUAL_ACCOUNT_ISSUED"; // 가상계좌 발급 완료
      } else {
        return "AWAITING_PAYMENT"; // 가상계좌 발급 필요
      }
    } else if (quote.statusChange === "IN_PROGRESS" || !quote.statusChange) {
      return "AWAITING_PAYMENT";
    } else if (
      quote.statusChange === "READY_FOR_DELIVERY" ||
      quote.statusChange === "COMPLETED"
    ) {
      return "COMPLETED";
    }
    return "AWAITING_PAYMENT"; // 기본적으로 입금하기 버튼 표시
  };

  const handlePaymentClick = (e, quote) => {
    e.stopPropagation(); // 행 클릭 이벤트 방지

    // 가상계좌 발급 페이지로 이동하면서 수리내역 정보 전달
    navigate("/payment/virtualaccount", {
      state: {
        customerName: quote.customerName,
        requestNo: quote.requestNo,
        paymentAmount: quote.cost,
      },
    });
  };

  const renderPaymentButton = (quote) => {
    const paymentStatus = getPaymentStatus(quote);

    if (paymentStatus === "AWAITING_PAYMENT") {
      return (
        <button
          className={styles.paymentButton}
          onClick={(e) => handlePaymentClick(e, quote)}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "4px 12px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          가상계좌발급
        </button>
      );
    } else if (paymentStatus === "VIRTUAL_ACCOUNT_ISSUED") {
      return (
        <span
          style={{
            color: "#FFA500",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          계좌발급완료
        </span>
      );
    } else if (paymentStatus === "COMPLETED") {
      return (
        <span
          style={{
            color: "#28a745",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          계좌입금완료
        </span>
      );
    } else {
      return <span style={{ fontSize: "12px", color: "#6c757d" }}>-</span>;
    }
  };

  const handleRowClick = (quote) => {
    // 수리 내역 작성 페이지로 이동하면서 데이터 전달
    navigate("/repair/write", {
      state: {
        quote: quote,
        mode: "edit", // 상세보기/편집 모드임을 나타냄
      },
    });
  };

  return (
    <div className={styles.container}>
      <SidebarNavigation />

      <RepairSearch
        quotes={quotes}
        setQuotes={setQuotes}
        pagination={pagination}
        setPagination={setPagination}
      />

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
            onClick={deleteSelectedQuotes}
            className={styles.deleteButton}
          >
            삭제 ({selectedQuotes.length})
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
                <th>접수번호</th>
                <th>고객명</th>
                <th>제품명</th>
                <th>제품고유번호</th>
                <th>접수일자</th>
                <th>진행상태</th>
                <th>접수기사</th>
                <th>입금상태</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan="10" className={styles.emptyState}>
                    <h3>데이터가 없습니다</h3>
                    <p>검색 조건에 맞는 견적 데이터가 없습니다.</p>
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr
                    key={quote.quoteId}
                    onClick={() => handleRowClick(quote)}
                    style={{ cursor: "pointer" }}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedQuotes.includes(quote.quoteId)}
                        onChange={() => handleSelectQuote(quote.quoteId)}
                      />
                    </td>
                    <td>{quote.requestNo}</td>
                    <td>{quote.customerName}</td>
                    <td>{quote.productName}</td>
                    <td>{quote.serialNumber}</td>
                    <td>{formatDateTime(quote.createdAt)}</td>
                    <td>{formatStatus(quote.statusChange)}</td>
                    <td>{quote.employeeName}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {renderPaymentButton(quote)}
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
};

export default RepairListPage;
