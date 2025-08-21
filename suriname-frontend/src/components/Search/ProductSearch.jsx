import React, { useState, useEffect, useCallback } from "react";
// import algoliasearch from 'algoliasearch'; // Temporarily disabled
import * as XLSX from "xlsx"; // ✨ XLSX 라이브러리 임포트 ✨
import { saveAs } from "file-saver"; // ✨ file-saver 임포트 ✨

// Temporarily disable Algolia for development
// TODO: Re-enable when Algolia is properly configured

// // 환경 변수 값 확인 (개발 중에는 로그 찍어보자)
// console.log(import.meta.env.ALGOLIA_APP_ID);
// console.log(import.meta.env.ALGOLIA_SEARCH_API_KEY);

// // Algolia 클라이언트 설정c
// const searchClient = algoliasearch(
//     import.meta.env.ALGOLIA_APP_ID,
//     import.meta.env.ALGOLIA_SEARCH_API_KEY
// );

// // 인덱스 객체 생성
// const index = searchClient.initIndex('products');

const categories = [
  "냉장고",
  "세탁기",
  "에어컨",
  "전자레인지",
  "TV",
  "데스크톱",
  "노트북",
  "프린터",
  "모니터",
  "스마트폰",
  "태블릿",
  "네비게이션",
  "블랙박스",
  "오디오시스템",
  "청소기",
  "공기청정기",
];
const manufacturers = ["Samsung", "LG", "Apple", "ASUS"];

const ProductSearch = ({
  data,
  setData,
  setTotalPages,
  itemsPerPage,
  setCurrentPage,
}) => {
  const [query, setQuery] = useState({
    manufacturers: [],
    categories: [],
    productName: "",
    modelCode: "",
  });

  // 검색 결과 통계
  const [searchStats, setSearchStats] = useState({
    totalHits: 0,
    processingTime: 0,
  });

  // 디바운스를 위한 타이머
  const [searchTimer, setSearchTimer] = useState(null);

  // 기본 제품 검색 수행 (Algolia 대신)
  const performSearch = useCallback(async () => {
    try {
      // API 요청으로 제품 데이터 가져오기 (기본 검색)
      const params = new URLSearchParams({
        page: "0",
        size: String(itemsPerPage),
      });
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/products/search?${params}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productName: query.productName || null,
          modelCode: query.modelCode || null,
          manufacturers:
            query.manufacturers.length > 0 ? query.manufacturers : null,
          categories: query.categories.length > 0 ? query.categories : null,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const page = result.data || {};
        const products = page.content || [];

        setData(products);
        setTotalPages(page.totalPages ?? 0);
        setCurrentPage(1);

        setSearchStats({
          totalHits: page.totalElements ?? products.length,
          processingTime: 50, // Mock processing time
        });
      } else {
        console.error("제품 검색 API 요청 실패:", response.status);
        setData([]);
        setTotalPages(0);
        setSearchStats({ totalHits: 0, processingTime: 0 });
      }
    } catch (error) {
      console.error("제품 검색 실패:", error);
      setData([]);
      setTotalPages(0);
      setSearchStats({ totalHits: 0, processingTime: 0 });
    }
  }, [query, setData, setTotalPages, itemsPerPage, setCurrentPage]);

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

  // 제조사 체크박스 변경 핸들러
  const handleManufacturerChange = (manufacturer) => {
    setQuery((prev) => {
      const exists = prev.manufacturers.includes(manufacturer);
      return {
        ...prev,
        manufacturers: exists
          ? prev.manufacturers.filter((m) => m !== manufacturer)
          : [...prev.manufacturers, manufacturer],
      };
    });
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    setQuery((prev) => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((m) => m !== category)
          : [...prev.categories, category],
      };
    });
  };

  // 검색 초기화
  const handleReset = () => {
    setQuery({
      manufacturers: [],
      categories: [],
      productName: "",
      modelCode: "",
    });
  };

  // 엑셀 다운로드
  const handleDownloadExcel = useCallback(() => {
    console.log("엑셀 다운로드할 데이터:", data);

    if (!data || data.length === 0) {
      alert("다운로드할 데이터가 없습니다!");
      return;
    }

    const excelHeaders = [
      "제품 ID",
      "제조사",
      "카테고리",
      "제품명",
      "모델코드",
      "비고",
    ];

    const excelData = data.map((item) => [
      item.objectID || "", // objectID를 제품 ID로 사용
      item.productBrand || "",
      item.categoryName || "",
      item.productName || "",
      item.modelCode || "",
      "-",
    ]);

    // 워크북 생성 (빈 엑셀 파일 생성)
    const workbook = XLSX.utils.book_new();

    // 헤더와 데이터를 합쳐서 워크시트 생성
    // XLSX.utils.aoa_to_sheet: 배열의 배열(Array of Arrays)을 시트로 변환
    const worksheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...excelData]);

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, "제품 목록"); // 시트 이름은 '제품 목록'

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
    saveAs(dataBlob, `제품목록_${new Date().toLocaleDateString("ko-KR")}.xlsx`);

    alert("엑셀 파일을 생성하고 다운로드를 시작합니다!");
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">제품 검색</h2>
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
            모델코드
          </label>
          <input
            name="modelCode"
            type="text"
            placeholder="모델코드 입력"
            value={query.modelCode}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 제조사 다중 선택 필터 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제조사
        </label>
        <div className="flex flex-wrap gap-2">
          {manufacturers.map((manufacturer) => {
            const isSelected = query.manufacturers.includes(manufacturer);
            return (
              <button
                key={manufacturer}
                type="button"
                onClick={() => handleManufacturerChange(manufacturer)}
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
                {manufacturer}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제품분류
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            // category map
            // 해당 카테고리가 현재 선택된 상태인지 확인
            const isSelected = query.categories.includes(category); // query.categories
            return (
              <button
                key={category} // category key
                type="button"
                onClick={() => handleCategoryChange(category)} // handleCategoryChange
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
                {category} {/* category 텍스트 */}
              </button>
            );
          })}
        </div>
      </div>

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

export default ProductSearch;
