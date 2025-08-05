import React, { useState, useEffect } from 'react';
import SidebarNavigation from '../components/SidebarNavigation';
import { getPayments, deletePayments } from '../api/payment';
import '../css/PaymentList.css';

const PaymentListPage = () => {
  const [searchData, setSearchData] = useState({
    customerName: '',
    receptionNumber: '',
    bankName: '',
    paymentAmount: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    first: true,
    last: true
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
        ...(searchParams || searchData)
      };

      // 빈 값 제거
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('Fetching payments with params:', params);

      const data = await getPayments(params);
      console.log('Response data:', data);
      
      setPayments(data.content || []);
      setPagination({
        currentPage: data.currentPage || 0,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0,
        size: data.size || 10,
        first: data.first !== false,
        last: data.last !== false
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert(`데이터 로드 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
    setLoading(false);
  };

  const deleteSelectedPayments = async () => {
    if (selectedPayments.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedPayments.length}개의 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePayments(selectedPayments);
      alert('선택된 항목이 삭제되었습니다.');
      setSelectedPayments([]);
      setSelectAll(false);
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payments:', error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    }
  };

  // 이벤트 핸들러들
  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    fetchPayments(searchData);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(payment => payment.paymentId));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        const newSelected = prev.filter(id => id !== paymentId);
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
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\./g, '-').replace(/, /g, ' ');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return amount.toLocaleString('ko-KR');
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(0, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages - 1, pagination.currentPage + 2);

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
          className={`page-btn ${pagination.currentPage === i ? 'active' : ''}`}
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
    <div className="payment-list-container">
      <SidebarNavigation />
      
      <div className="main-content">
        {!searchVisible ? (
          <div className="search-toggle-btn" onClick={toggleSearchVisible}>
            검색창 열기 ㅁ
          </div>
        ) : (
          <div className="search-wrap">
            <div className="search-close-btn" onClick={toggleSearchVisible}>
              검색창 닫기 ×
            </div>
            
            <div className="search-fields">
              <div className="search-row">
                <div className="search-field">
                  <label>고객명</label>
                  <input
                    type="text"
                    value={searchData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                  />
                </div>
                
                <div className="search-field">
                  <label>접수번호</label>
                  <input
                    type="text"
                    value={searchData.receptionNumber}
                    onChange={(e) => handleInputChange('receptionNumber', e.target.value)}
                  />
                </div>

                <div className="search-field">
                  <label>은행이름</label>
                  <input
                    type="text"
                    value={searchData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>
                
                <div className="search-field">
                  <label>입금금액</label>
                  <input
                    type="text"
                    value={searchData.paymentAmount || ''}
                    onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                    placeholder="금액 입력"
                  />
                </div>
              </div>
              
              <div className="search-row">
                <div className="search-field date-range">
                  <label>입금완료시각</label>
                  <div className="date-inputs">
                    <input
                      type="date"
                      value={searchData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                    <span>~</span>
                    <input
                      type="date"
                      value={searchData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="search-field status-field">
                  <label>입금상태</label>
                  <select
                    value={searchData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="">전체</option>
                    <option value="입금완료">입금완료</option>
                    <option value="입금대기">입금대기</option>
                    <option value="입금실패">입금실패</option>
                  </select>
                </div>
                
                <div className="search-actions">
                  <button className="search-btn" onClick={handleSearch} disabled={loading}>
                    {loading ? '검색 중...' : '검색'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="content-section">
          <div className="section-header">
            <div className="section-controls">
              <label className="select-all">
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <span>전체 선택</span>
              </label>
              <button className="delete-btn" onClick={deleteSelectedPayments}>
                삭제 ({selectedPayments.length})
              </button>
            </div>
          </div>

          <div className="payment-table-container">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                데이터를 불러오는 중...
              </div>
            ) : (
              <table className="payment-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>고객명</th>
                    <th>접수번호</th>
                    <th>가상계좌번호</th>
                    <th>은행이름</th>
                    <th>결제금액</th>
                    <th>입금상태</th>
                    <th>입금완료시각</th>
                    <th>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                        조회된 데이터가 없습니다.
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
                        <td>{payment.virtualAccountNumber || '-'}</td>
                        <td>{payment.bankName || '-'}</td>
                        <td>{formatCurrency(payment.paymentAmount)}</td>
                        <td>{payment.depositStatus}</td>
                        <td>{formatDateTime(payment.confirmedAt)}</td>
                        <td>{payment.memo || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              {renderPagination()}
            </div>
          )}
          
          <div className="pagination-info">
            총 {pagination.totalElements}개 중 {pagination.currentPage * pagination.size + 1}-{Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)}개 표시
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentListPage;