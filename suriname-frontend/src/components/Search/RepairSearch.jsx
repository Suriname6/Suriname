import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx"; // ✨ XLSX 라이브러리 임포트 ✨
import { saveAs } from "file-saver"; // ✨ file-saver 임포트 ✨

const statusOptions = [
    { label: "접수", value: "RECEIVED" },
    { label: "수리중", value: "REPAIRING" },
    { label: "입금 대기", value: "WAITING_FOR_PAYMENT" },
    { label: "배송 대기", value: "WAITING_FOR_DELIVERY" },
    { label: "배송 완료", value: "COMPLETED" },
];

const RepairSearch = ({
                           quotes,
                           setQuotes,
                           pagination,
                           setPagination
                       }) => {
    const [query, setQuery] = useState({
        requestNo: "",
        customerName: "",
        productName: "",
        modelCode: "",
        startCreateAt: "",
        endCreateAt: "",
        status: [],
        employName: "",
    });

    const [searchStats, setSearchStats] = useState({
        totalHits: 0,
        processingTime: 0,
    });

    const handleStatusChange = (status) => {
        setQuery(prev => {
            const exists = prev.status.includes(status);
            return {
                ...prev,
                status: exists
                    ? prev.status.filter(s => s !== status)
                    : [...prev.status, status],
            };
        });
    };

    // 디바운스를 위한 타이머
    const [searchTimer, setSearchTimer] = useState(null);

    // 기본 제품 검색 수행
    const performSearch = useCallback(async () => {
        try {
            // API 요청으로 제품 데이터 가져오기
            const params = new URLSearchParams({
                page: "0",
                size: String(pagination.size),
            });
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`/api/quotes/search?${params}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    requestNo: query.requestNo || null,
                    customerName: query.customerName || null,
                    productName: query.productName || null,
                    modelCode: query.modelCode || null,
                    startCreateAt: query.startCreateAt || null,
                    endCreateAt: query.endCreateAt || null,
                    status: query.status?.length > 0 ? query.status : null,
                    employName: query.employName || null,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                const page = result.data || {};
                const products = page.content || [];

                console.log("result: ", result);

                setQuotes(products);
                console.log("quotes: ", quotes);
                setPagination(prev => ({
                    ...prev,
                    totalPages: page.totalPages ?? 0,
                    currentPage: 1,
                }))

                setSearchStats({
                    totalHits: page.totalElements ?? products.length,
                    processingTime: 50, // Mock processing time
                });
            } else {
                console.error("제품 검색 API 요청 실패:", response.status);
                setQuotes([]);
                setPagination(prev => ({
                    ...prev,
                    totalPages: 0,
                }))
                setSearchStats({ totalHits: 0, processingTime: 0 });
            }
        } catch (error) {
            console.error("제품 검색 실패:", error);
            setQuotes([]);
            setPagination(prev => ({
                ...prev,
                totalPages: 0,
            }))
            setSearchStats({ totalHits: 0, processingTime: 0 });
        }
    }, [query, setQuotes, setPagination]);

    // 실시간 검색 (디바운스 적용)
    useEffect(() => {
        // 기존 타이머 클리어
        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        // 300ms 후 검색 실행
        const timer = setTimeout(() => {
            performSearch();
        }, 300);

        setSearchTimer(timer);

        // 클린업
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [performSearch]);

    // 입력 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuery((prev) => ({ ...prev, [name]: value }));
    };

    // 검색 초기화
    const handleReset = () => {
        setQuery({
            requestNo: "",
            customerName: "",
            productName: "",
            modelCode: "",
            startCreateAt: "",
            endCreateAt: "",
            status: [],
            employName: "",
        });
    };

    // 엑셀 다운로드
    const handleDownloadExcel = useCallback(() => {
        console.log("엑셀 다운로드할 데이터:", quotes);

        if (!quotes || quotes.length === 0) {
            alert("다운로드할 데이터가 없습니다!");
            return;
        }

        const excelHeaders = [
            "접수번호",
            "고객명",
            "제품명",
            "제품고유번호",
            "접수일자",
            "진행상태",
            "접수기사",
            "입금상태",
        ];

        const excelData = quotes.map((item) => [
            item.requestNo || "", // objectID를 제품 ID로 사용
            item.customerName || "",
            item.productName || "",
            item.modelCode || "",
            item.startCreateAt || "",
            item.status || "",
            item.employName || "",
            item.paymentStatus || "",
        ]);

        // 워크북 생성 (빈 엑셀 파일 생성)
        const workbook = XLSX.utils.book_new();

        // 헤더와 데이터를 합쳐서 워크시트 생성
        // XLSX.utils.aoa_to_sheet: 배열의 배열(Array of Arrays)을 시트로 변환
        const worksheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...excelData]);

        // 워크시트를 워크북에 추가
        XLSX.utils.book_append_sheet(workbook, worksheet, "수리 목록"); // 시트 이름은 '제품 목록'

        // 엑셀 파일 저장
        // XLSX.write: 워크북을 바이너리 데이터로 변환
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        // Blob (Binary Large Object) 생성
        const dataBlob = new Blob([excelBuffer], {
            type: "application/octet-stream",
        });

        // 파일 다운로드
        // saveAs(데이터, '파일이름.확장자')
        saveAs(dataBlob, `수리목록_${new Date().toLocaleDateString("ko-KR")}.xlsx`);

        alert("엑셀 파일을 생성하고 다운로드를 시작합니다!");
    }, [quotes]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">수리 목록 검색</h2>
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        접수기사
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
                <br />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작 날짜
                    </label>
                    <input
                        name="startCreateAt"
                        type="date"
                        placeholder="접수일자 입력"
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
                        placeholder="접수일자 입력"
                        value={query.endCreateAt}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <br />
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        진행상태
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map(({ label, value }) => {
                            const isSelected = query.status?.includes(value) || false;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleStatusChange(value)}
                                    className={`
                                                px-4 py-2 rounded-full text-sm font-medium 
                                                transition-colors duration-200 ease-in-out
                                                ${
                                        isSelected
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                                    }
                                            `}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex justify-between items-center">
                <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    초기화
                </button>

                {/* 엑셀 다운로드 버튼 */}
                <button
                    onClick={handleDownloadExcel}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 border border-green-600 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    엑셀 다운로드
                </button>

                <div className="text-xs text-gray-500">
                    🔍 입력하신 내용에 따라 실시간으로 검색됩니다
                </div>
            </div>
        </div>
    );
}

export default RepairSearch;