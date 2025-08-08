import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNavigation from '../../components/SidebarNavigation';
import { getQuotes, deleteQuotes } from '../../api/quote';
import styles from '../../css/Repair/RepairList.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RepairListPage = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    customerName: '',
    requestNo: '',
    productName: '',
    serialNumber: '',
    isApproved: '',
    employeeName: '',
    startDate: '',
    endDate: ''
  });

  const [quotes, setQuotes] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    first: true,
    last: true
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
        ...(searchParams || searchData)
      };

      // 빈 값 제거
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Fetching quotes with params:', params);

      const data = await getQuotes(params);
      console.log('Response data:', data);
      
      if (!data) {
              throw new Error('서버에서 데이터를 받지 못했습니다');
            }
      
      setQuotes(data.content || []);
      setPagination({
        currentPage: data.currentPage || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        size: data.size || 10,
        first: data.first !== false,
        last: data.last !== false
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      alert(`데이터 로드 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
    setLoading(false);
  };

  const deleteSelectedQuotes = async () => {
    if (selectedQuotes.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedQuotes.length}개의 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteQuotes(selectedQuotes);
      alert('선택된 항목이 삭제되었습니다.');
      setSelectedQuotes([]);
      setSelectAll(false);
      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quotes:', error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  // 검색 입력 처리
  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchQuotes(searchData);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(quotes.map(quote => quote.quoteId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectQuote = (quoteId) => {
    setSelectedQuotes(prev => {
      if (prev.includes(quoteId)) {
        const newSelected = prev.filter(id => id !== quoteId);
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
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, '-').replace(/, /g, ' ');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return amount.toLocaleString('ko-KR');
  };

  const formatStatus = (status) => {
    if (!status) return '수리중';
    
    const statusMap = {
      'IN_PROGRESS': '수리중',
      'AWAITING_PAYMENT': '입금 대기',
      'READY_FOR_DELIVERY': '배송 대기',
      'COMPLETED': '완료'
    };
    
    return statusMap[status] || status;
  };

  const handleRowClick = (quote) => {
    // 수리 내역 작성 페이지로 이동하면서 데이터 전달
    console.log('클릭된 견적:', quote);
    navigate('/repair/write', { 
      state: { 
        quote: quote,
        mode: 'edit' // 상세보기/편집 모드임을 나타냄
      } 
    });
  };

  return (
    <div className={styles.container}>
      <SidebarNavigation />
      
      {!searchVisible ? (
        <div className={styles.searchToggle}>
          <button className={styles.searchToggleBtn} onClick={toggleSearchVisible}>
            검색 조건
          </button>
        </div>
      ) : (
        <div className={styles.searchWrap}>
          <div className={styles.searchCloseBtn}>
            <button onClick={toggleSearchVisible}>
              검색 조건 닫기
            </button>
          </div>
          
          <div className={styles.searchFields}>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <label>고객명</label>
                <input
                  type="text"
                  placeholder="입력"
                  value={searchData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              </div>

              <div className={styles.searchField}>
                <label>제품명</label>
                <input
                  type="text"
                  value={searchData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                />
              </div>
              
              <div className={styles.searchField}>
                <label>제품고유번호</label>
                <input
                  type="text"
                  placeholder="입력"
                  value={searchData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                />
              </div>
              <div className={styles.searchField}>
                <label>접수기사</label>
                <input
                  type="text"
                  placeholder="입력"
                  value={searchData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                />
              </div>
            </div>
            
            <div className={styles.searchRow}>

              
              <div className={styles.searchField}>
                <label>승인상태</label>
                <select
                  value={searchData.isApproved}
                  onChange={(e) => handleInputChange('isApproved', e.target.value)}
                >
                  <option value="">전체</option>
                  <option value="승인">승인</option>
                  <option value="미승인">미승인</option>
                </select>
              </div>
              
              <div className={styles.searchField}>
                <label>접수일자</label>
                <input
                  type="date"
                  value={searchData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              
              <div className={styles.searchField}>
                <label>　</label>
                <input
                  type="date"
                  value={searchData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
              
              <button className={styles.searchButton} onClick={handleSearch} disabled={loading}>
                {loading ? '검색 중...' : '검색'}
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
          <button onClick={deleteSelectedQuotes} className={styles.deleteButton}>
            삭제 ({selectedQuotes.length})
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
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
                  <tr key={quote.quoteId} onClick={() => handleRowClick(quote)} style={{cursor: 'pointer'}}>
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
                    <td>{quote.paymentStatus || '-'}</td>
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
};

export default RepairListPage;