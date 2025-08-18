import React, {useCallback, useEffect, useState} from "react";
import axios from "../../api/axiosInstance";
import styles from '../../css/Request/RequestList.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

import StatusBadge from "../../components/Request/StatusBadge";
import StatusSelect from "../../components/Request/StatusSelect";
import RequestSearch from "../../components/Search/RequestSearch.jsx"

export default function RequestList() {
    const [requests, setRequests] = useState([]);
    const [searchData, setSearchData] = useState({
        customerName: '',
        productName: '',
        category: '',
        brand: '',
        modelCode: '',
        employName: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        size: 10,
        first: true,
        last: true
    });
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [role] = useState(localStorage.getItem("role") || "ADMIN");

    const fetchRequests = useCallback( async () => {
        setLoading(true);
        try {
            const cleaned = Object.fromEntries(
                Object.entries(searchData).filter(([, v]) => v !== "")
            );
            const params = {
                    ...cleaned,
                page: pagination.currentPage,   // 0-base (Spring Data Pageable)
                size: pagination.size
            };
            const res = await axios.get("/api/requests", { params });

            const {
                content,
                number: currentPage,
                totalPages,
                totalElements,
                size,
                first,
                last
            } = res.data;

            if (content.length === 0 && totalElements > 0 && pagination.currentPage > 0) {
                setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                return; // 이번 렌더는 중단하고 useEffect로 재조회
           }

            // 역할별 우선순위 정렬
            setRequests(content);
            setPagination({ currentPage, totalPages, totalElements, size, first, last });
            setSelectedRequests([])
            setSelectAll(false);
        } catch (err) {
            console.error("요청 목록 불러오기 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [searchData]);

    // 초기 로드 & 페이지 변경 시
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const deleteSelectedRequests = async () => {
        if (selectedRequests.length === 0) {
            alert('선택된 항목이 없습니다.');
            return;
        }
        if (!window.confirm(`선택된 ${selectedRequests.length}개 항목을 삭제하시겠습니까?`)) return;
        try {
            await axios.delete("/api/requests", { data: { ids: selectedRequests } });
            alert('선택된 항목이 삭제되었습니다.');
            setSelectedRequests([]);
            setSelectAll(false);
            fetchRequests();
        } catch (error) {
            console.error('Error deleting Requests:', error);
            alert(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
        }
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRequests([]);
        } else {
            setSelectedRequests(requests.map(r => r.requestId));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectRequest = (requestId) => {
        setSelectedRequests(prev => {
            if (prev.includes(requestId)) {
                const next = prev.filter(id => id !== requestId);
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
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    const updateAssignmentStatus = async (requestId, status, reason = "") => {
        try {
            await axios.put(`/api/requests/${requestId}/assignment-status`, { status, reason });
            alert("상태가 변경되었습니다.");
            fetchRequests();
        } catch (err) {
            console.error("상태 변경 실패", err);
            alert("상태 변경에 실패했습니다.");
        }
    };

    const handleAccept = (request) => {
        if (request.status !== "PENDING") {
            alert("대기 상태(PENDING)에서만 접수가 가능합니다.");
            return;
        }
        if (!window.confirm(`[${request.requestNo}]를 접수(ACCEPTED) 상태로 변경할까요?`)) return;
        updateAssignmentStatus(request.requestId, "ACCEPTED");
    };

    return (
        <div className={styles.container}>
            <RequestSearch
                requests={requests}
                setRequests={setRequests}
                pagination={pagination}
                setPagination={setPagination}
            />

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
                        <button onClick={deleteSelectedRequests} className={styles.deleteButton}>
                            삭제
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.tableWrapper}>
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                        데이터를 불러오는 중...
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            {(role === "ADMIN" || role === "STAFF") && <th className={styles.narrowTh}></th>}
                            {role === "ENGINEER" && <th>작업하기</th>}
                            <th>접수번호</th>
                            <th>고객명</th>
                            <th>제품명</th>
                            <th>제품모델코드</th>
                            <th>접수일자</th>
                            <th>접수상태</th>
                            <th>수리 담당자</th>
                            <th>상세 페이지</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={role === 'ENGINEER' ? 10 : 9} className={styles.emptyState}>
                                    <h3>데이터가 없습니다</h3>
                                    <p>검색 조건에 맞는 수리 내역이 접수되지 않았습니다.</p>
                                </td>
                            </tr>
                        ) : (
                            requests.map((request) => (
                                <tr
                                    key={request.requestId}
                                    className={request.status === "ACCEPTED" ? styles.acceptedRow : undefined}
                                >
                                    {(role === "ADMIN" || role === "STAFF") && (
                                        <td className={styles.narrowTd}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRequests.includes(request.requestId)}
                                                onChange={() => handleSelectRequest(request.requestId)}
                                            />
                                        </td>
                                    )}

                                    {role === "ENGINEER" && (
                                        <td>
                                            <button
                                                onClick={() => handleAccept(request)}
                                                disabled={request.status !== "PENDING"}
                                                className={`${styles.btn} ${styles.btnAccept}`}
                                                title={request.status === "PENDING" ? "접수 가능" : "대기 상태에서만 접수 가능"}
                                            >
                                                접수
                                            </button>
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
                                            onClick={() => navigate(`/request/${request.requestId}`)}
                                            style={{
                                                padding: "6px 10px",
                                                borderRadius: 6,
                                                border: "1px solid #e5e7eb",
                                                background: "white",
                                                cursor: "pointer"
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
                    onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
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
                    onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                    disabled={pagination.currentPage === pagination.totalPages - 1}
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    );
}
