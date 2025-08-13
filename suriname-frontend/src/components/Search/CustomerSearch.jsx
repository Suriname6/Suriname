import React, { useState, useEffect, useCallback } from "react";
// import algoliasearch from 'algoliasearch'; // Temporarily disabled
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';

// Temporarily disable Algolia for development
// TODO: Re-enable when Algolia is properly configured

const manufacturers = ["삼성", "LG", "Apple"];

const CustomerSearch = ({ data, setData, setTotalPages, itemsPerPage, setCurrentPage }) => {
  const [query, setQuery] = useState({
    customerName: '',
    address: '',
    productName: '',
    modelCode: '',
    phone: '',
    email: '',
    manufacturers: [],
  });

  // 검색 결과 통계
  const [searchStats, setSearchStats] = useState({
    totalHits: 0,
    processingTime: 0
  });

  // 디바운스를 위한 타이머
  const [searchTimer, setSearchTimer] = useState(null);

  // 기본 검색 수행 (Algolia 대신 백엔드 API 사용)
  const performSearch = useCallback(async () => {
    // 검색 조건이 모두 비어있으면 검색하지 않음
    const hasSearchTerm = query.customerName || query.address || query.productName || 
                         query.modelCode || query.phone || query.email || 
                         query.manufacturers.length > 0;
    
    if (!hasSearchTerm) {
      setData([]);
      setTotalPages(0);
      setSearchStats({ totalHits: 0, processingTime: 0 });
      return;
    }

    try {
      // API 요청으로 고객 데이터 가져오기 (기본 검색)
      const response = await fetch('/api/customers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: query.customerName || null,
          address: query.address || null,
          productName: query.productName || null,
          modelCode: query.modelCode || null,
          phone: query.phone || null,
          email: query.email || null,
          manufacturers: query.manufacturers.length > 0 ? query.manufacturers : null
        })
      });

      if (response.ok) {
        const result = await response.json();
        const customers = result.data?.content || [];
        
        setData(customers);
        setTotalPages(Math.ceil(customers.length / itemsPerPage));
        setCurrentPage(1);
        
        setSearchStats({
          totalHits: customers.length,
          processingTime: 50 // Mock processing time
        });
      } else {
        console.error("검색 API 요청 실패:", response.status);
        setData([]);
        setTotalPages(0);
        setSearchStats({ totalHits: 0, processingTime: 0 });
      }

    } catch (error) {
      console.error("검색 실패:", error);
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
    setQuery(prev => ({ ...prev, [name]: value }));
  };

  // 제조사 체크박스 변경 핸들러
  const handleManufacturerChange = (manufacturer) => {
    setQuery(prev => {
      const exists = prev.manufacturers.includes(manufacturer);
      return {
        ...prev,
        manufacturers: exists
          ? prev.manufacturers.filter(m => m !== manufacturer)
          : [...prev.manufacturers, manufacturer]
      };
    });
  };

  // 검색 초기화
  const handleReset = () => {
    setQuery({
      customerName: '',
      address: '',
      productName: '',
      modelCode: '',
      phone: '',
      email: '',
      manufacturers: [],
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
      "고객 ID",
      "이름",
      "생년월일",
      "연락처",
      "이메일",
      "주소",
      "제품분류",
      "제품명",
      "제조사",
      "모델코드",
      "제품고유번호"
    ];

    const excelData = data.map(item => [
      item.objectID || '', // objectID를 고객 ID로 사용
      item.customerName || '',
      item.birth || '',
      item.phone || '',
      item.email || '',
      item.address || '',
      item.categoryName || '',
      item.productName || '',
      item.productBrand || '',
      item.modelCode || '',
      item.serialNumber || ''
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
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Blob (Binary Large Object) 생성
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // 파일 다운로드
    // saveAs(데이터, '파일이름.확장자')
    saveAs(dataBlob, `제품목록_${new Date().toLocaleDateString('ko-KR')}.xlsx`);

    alert("엑셀 파일을 생성하고 다운로드를 시작합니다!");
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">고객 검색</h2>
        <div className="text-sm text-gray-600">
          {searchStats.totalHits > 0 && (
            <span>
              {searchStats.totalHits.toLocaleString()}개 결과 
              ({searchStats.processingTime}ms)
            </span>
          )}
        </div>
      </div>

      {/* 검색 필드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
            연락처
          </label>
          <input
            name="phone"
            type="text"
            placeholder="연락처 입력"
            value={query.phone}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일
          </label>
          <input
            name="email"
            type="text"
            placeholder="이메일 입력"
            value={query.email}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주소
          </label>
          <input
            name="address"
            type="text"
            placeholder="주소 입력"
            value={query.address}
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
          {manufacturers.map(manufacturer => {
            // 해당 제조사가 현재 선택된 상태인지 확인
            const isSelected = query.manufacturers.includes(manufacturer);
            return (
                <button
                    key={manufacturer}
                    type="button" // 폼 제출 방지
                    onClick={() => handleManufacturerChange(manufacturer)}
                    // Tailwind CSS를 이용한 조건부 스타일링!
                    className={`
                        px-4 py-2 rounded-full text-sm font-medium 
                        transition-colors duration-200 ease-in-out
                        ${isSelected
                        ? 'bg-blue-600 text-white shadow-md' // 선택되었을 때 스타일
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300' // 선택되지 않았을 때 스타일
                    }
                    `}
                >
                  {manufacturer}
                </button>
            );
          })}
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
};

export default CustomerSearch;