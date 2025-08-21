import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

const RequestSearch = ({
  requests,
  setRequests,
  pagination,
  setPagination,
  defaultFilters = {},
  lockedFilters = {},
}) => {
  const role = localStorage.getItem("role");
  const canFilterByEmployee = role === "ADMIN" || role === "STAFF";

  const [query, setQuery] = useState({
    requestNo: "",
    customerName: "",
    productName: "",
    modelCode: "",
    startCreateAt: "",
    endCreateAt: "",
    employName: "",
    // UI에서 선택한 요청 상태(locked 없을 때만 의미 있음)
    status: [],
    // 배정 상태(요청 상태가 RECEIVED일 때만 사용)
    assignmentStatus: [],
  });

  const [searchStats, setSearchStats] = useState({
    totalHits: 0,
    processingTime: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuery((prev) => ({ ...prev, [name]: value }));
  };

  // status 토글
  const handleStatusChange = (value) => {
    setQuery((prev) => {
      const next = new Set(prev.status ?? []);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, status: Array.from(next) };
    });
  };

  // assignmentStatus 토글
  const handleAssignChange = (value) => {
    setQuery((prev) => {
      const next = new Set(prev.assignmentStatus ?? []);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, assignmentStatus: Array.from(next) };
    });
  };

  // effectiveStatus: locked > query(UI) > default
  const getEffectiveStatus = () => {
    const locked = toArray(lockedFilters.status);
    if (locked.length) return locked;
    const q = toArray(query.status);
    if (q.length) return q;
    return toArray(defaultFilters.status);
  };

  const isReceived = getEffectiveStatus().includes("RECEIVED");
  const hasLockedStatus = toArray(lockedFilters.status).length > 0;

  const performSearch = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(pagination.currentPage || 0),
        size: String(pagination.size),
      });

      const token = localStorage.getItem("accessToken");

      // --- 기본값 수집 ---
      const effectiveStatus = getEffectiveStatus();

      const assignFromLocked = toArray(
        lockedFilters.assignmentStatus ?? lockedFilters.assignmentStatuses
      );
      const assignFromDefault = toArray(
        defaultFilters.assignmentStatus ?? defaultFilters.assignmentStatuses
      );
      const effectiveAssign = assignFromLocked.length
        ? assignFromLocked
        : assignFromDefault;

      const body = {
        requestNo: query.requestNo || null,
        customerName: query.customerName || null,
        productName: query.productName || null,
        modelCode: query.modelCode || null,
        startCreateAt: query.startCreateAt || null,
        endCreateAt: query.endCreateAt || null,
        employName:
          canFilterByEmployee && query.employName ? query.employName : null,

        // 요청 상태
        status: effectiveStatus.length ? effectiveStatus : null,

        // 요청 상태가 RECEIVED일 때만 배정 상태 포함 (UI 선택 > 기본/locked)
        assignmentStatus: isReceived
          ? query.assignmentStatus?.length
            ? query.assignmentStatus
            : effectiveAssign.length
            ? effectiveAssign
            : null
          : null,
      };

      const res = await fetch(`/api/requests/search?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const result = await res.json();
        const page = result.data || {};
        const items = page.content || [];
        setRequests(items);
        setPagination((prev) => ({
          ...prev,
          totalPages: page.totalPages ?? 0,
          totalElements: page.totalElements ?? items.length,
          size: page.size ?? prev.size,
        }));
        setSearchStats({
          totalHits: page.totalElements ?? items.length,
          processingTime: 50,
        });
      } else {
        setRequests([]);
        setPagination((prev) => ({
          ...prev,
          totalPages: 0,
          totalElements: 0,
        }));
        setSearchStats({ totalHits: 0, processingTime: 0 });
        console.error("검색 실패:", res.status);
      }
    } catch (e) {
      console.error("검색 에러:", e);
      setRequests([]);
      setPagination((prev) => ({
        ...prev,
        totalPages: 0,
        totalElements: 0,
      }));
      setSearchStats({ totalHits: 0, processingTime: 0 });
    }
  }, [
    query.requestNo,
    query.customerName,
    query.productName,
    query.modelCode,
    query.startCreateAt,
    query.endCreateAt,
    query.employName,
    query.status,
    query.assignmentStatus,
    canFilterByEmployee,
    pagination.currentPage,
    pagination.size,
    setRequests,
    setPagination,
    // 외부 필터 의존성
    lockedFilters.status,
    lockedFilters.assignmentStatus,
    lockedFilters.assignmentStatuses,
    defaultFilters.status,
    defaultFilters.assignmentStatus,
    defaultFilters.assignmentStatuses,
    // 파생값 의존
    isReceived,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(t);
  }, [performSearch]);

  const handleReset = () => {
    const next = {
      requestNo: "",
      customerName: "",
      productName: "",
      modelCode: "",
      startCreateAt: "",
      endCreateAt: "",
      employName: "",
      status: [],
      assignmentStatus: [],
    };
    setQuery((prev) =>
      JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    );
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  };

  const handleDownloadExcel = useCallback(() => {
    if (!requests || requests.length === 0) {
      alert("다운로드할 데이터가 없습니다!");
      return;
    }

    const excelHeaders = [
      "접수번호",
      "고객명",
      "제품명",
      "제품모델코드",
      "접수일자",
      "요청상태",
      "배정상태",
      "수리 담당자",
    ];

    const excelData = requests.map((item) => [
      item.requestNo || "",
      item.customerName || "",
      item.productName || "",
      item.modelCode || "",
      item.createdAt || item.startDate || "",
      item.requestStatus || item.status || "",
      item.assignmentStatus || "",
      item.engineerName || item.employeeName || "",
    ]);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...excelData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "접수 목록");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, `접수목록_${new Date().toLocaleDateString("ko-KR")}.xlsx`);
    alert("엑셀 파일을 생성하고 다운로드를 시작합니다!");
  }, [requests]);

  // 요청 상태 옵션
  const requestStatusOptions = [
    { label: "접수", value: "RECEIVED" },
    { label: "수리중", value: "REPAIRING" },
    { label: "입금대기", value: "WAITING_FOR_PAYMENT" },
    { label: "배송대기", value: "WAITING_FOR_DELIVERY" },
    { label: "완료", value: "COMPLETED" },
  ];

  // 배정 상태 옵션
  const assignStatusOptions = [
    { label: "접수 대기", value: "PENDING" },
    { label: "접수 완료", value: "ACCEPTED" },
    { label: "만료됨", value: "EXPIRED" },
    { label: "거절됨", value: "REJECTED" },
    { label: "취소됨", value: "CANCELLED" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">접수 목록 검색</h2>
        <div className="text-sm text-gray-600">
          {searchStats.totalHits > 0 && (
            <span>
              {searchStats.totalHits.toLocaleString()}개 결과 (
              {searchStats.processingTime}ms)
            </span>
          )}
        </div>
      </div>

      {/* 검색 필드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            접수번호
          </label>
          <input
            name="requestNo"
            type="text"
            placeholder="접수번호 입력"
            value={query.requestNo}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고객명
          </label>
          <input
            name="customerName"
            type="text"
            placeholder="고객명 입력"
            value={query.customerName}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제품명
          </label>
          <input
            name="productName"
            type="text"
            placeholder="제품명 입력"
            value={query.productName}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제품모델코드
          </label>
          <input
            name="modelCode"
            type="text"
            placeholder="제품모델코드 입력"
            value={query.modelCode}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* STAFF/ADMIN만 직원명 필터 노출 */}
        {canFilterByEmployee && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수리 담당자
            </label>
            <input
              name="employName"
              type="text"
              placeholder="수리 담당자 입력"
              value={query.employName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시작 날짜
          </label>
          <input
            name="startCreateAt"
            type="date"
            placeholder="시작일"
            value={query.startCreateAt}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            종료 날짜
          </label>
          <input
            name="endCreateAt"
            type="date"
            placeholder="종료일"
            value={query.endCreateAt}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 요청 상태: lockedFilters.status가 없을 때만 노출 */}
      {!hasLockedStatus && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요청 상태
          </label>
          <div className="flex flex-wrap gap-2">
            {requestStatusOptions.map(({ label, value }) => {
              const isSelected = query.status?.includes(value) || false;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStatusChange(value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                    ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 배정 상태: 요청 상태가 RECEIVED일 때만 노출 */}
      {isReceived && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            배정 상태
          </label>
          <div className="flex flex-wrap gap-2">
            {assignStatusOptions.map(({ label, value }) => {
              const isSelected =
                query.assignmentStatus?.includes(value) || false;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleAssignChange(value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                    ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 w-fit mb-4"
          >
            초기화
          </button>
          <div className="text-xs text-gray-500">
            🔍 입력하신 내용에 따라 실시간으로 검색됩니다
          </div>
        </div>

        {/* 엑셀 다운로드 버튼 */}
        <button
          onClick={handleDownloadExcel}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 border border-green-600 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          엑셀 다운로드
        </button>
      </div>
    </div>
  );
};

export default RequestSearch;
