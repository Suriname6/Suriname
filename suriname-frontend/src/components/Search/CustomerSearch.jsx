import React, { useState, useEffect, useCallback } from "react";
import algoliasearch from 'algoliasearch/lite';

// 환경 변수 값 확인 (개발 중에는 로그 찍어보자)
console.log(import.meta.env.VITE_ALGOLIA_APP_ID);
console.log(import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY);

// Algolia 클라이언트 설정
const searchClient = algoliasearch(
    import.meta.env.VITE_ALGOLIA_APP_ID,
    import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY
);

// 인덱스 객체 생성
const index = searchClient.initIndex('customers');

const manufacturers = ["삼성", "LG", "Apple"];

const CustomerSearch = ({ setData, setTotalPages, itemsPerPage, setCurrentPage }) => {
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

  // Algolia 필터 빌드
  const buildFilters = useCallback(() => {
    const filters = [];

    if (query.manufacturers.length > 0) {
      const manufacturerFilters = query.manufacturers.map(m => `productBrand:"${m}"`);
      filters.push(`(${manufacturerFilters.join(' OR ')})`);
    }

    return filters.join(' AND ');
  }, [query.manufacturers]);

  // 검색 쿼리 빌드
  const buildSearchQuery = useCallback(() => {
    const searchTerms = [
      query.customerName,
      query.address,
      query.productName,
      query.modelCode,
      query.phone,
      query.email
    ].filter(Boolean);

    return searchTerms.join(' ');
  }, [query]);

  // Algolia 검색 수행
  const performSearch = useCallback(async () => {
    try {
      const searchQuery = buildSearchQuery();
      const filters = buildFilters();

      const searchOptions = {
        hitsPerPage: 1000, // 최대 결과 수 (페이지네이션은 클라이언트에서 처리)
        filters: filters || undefined,
        attributesToRetrieve: [
          'customerId',
          'customerName', 
          'birth',
          'phone',
          'email',
          'address',
          'categoryName',
          'productName',
          'productBrand',
          'modelCode',
          'serialNumber'
        ]
      };

      const response = await index.search(searchQuery, searchOptions);
      
      // 검색 결과를 CustomerList에 전달
      setData(response.hits);
      setTotalPages(Math.ceil(response.hits.length / itemsPerPage));
      setCurrentPage(1);
      
      // 검색 통계 업데이트
      setSearchStats({
        totalHits: response.nbHits,
        processingTime: response.processingTimeMS
      });

    } catch (error) {
      console.error("Algolia 검색 실패:", error);
      setData([]);
      setTotalPages(0);
      setSearchStats({ totalHits: 0, processingTime: 0 });
    }
  }, [buildSearchQuery, buildFilters, setData, setTotalPages, itemsPerPage, setCurrentPage]);

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
          {manufacturers.map(manufacturer => (
            <label 
              key={manufacturer} 
              className="inline-flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                checked={query.manufacturers.includes(manufacturer)}
                onChange={() => handleManufacturerChange(manufacturer)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{manufacturer}</span>
            </label>
          ))}
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
        
        <div className="text-xs text-gray-500">
          🔍 입력하신 내용에 따라 실시간으로 검색됩니다
        </div>
      </div>
    </div>
  );
};

export default CustomerSearch;