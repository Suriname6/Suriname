import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CustomerList.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomerSearchBar from './CustomerSearchBar';

const CustomerList = () => {
  const [data, setData] = useState([]);
  const [searchConditions, setSearchConditions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomerData();
  }, [currentPage, searchConditions]);

 const fetchCustomerData = async () => {
  try {
    const response = await axios.post('/api/customers/search', searchConditions, {
      params: {
        page: currentPage - 1,
        size: itemsPerPage,
      },
    });
    setData(response.data.data.content);
    setTotalPages(response.data.data.totalPages);
  } catch (err) {
    console.error('데이터 불러오기 실패:', err);
  }
};


  const handleSearch = (searchData) => {
    setCurrentPage(1);
    setSearchConditions(searchData);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const newSet = checked ? new Set(data.map(item => item.customerId)) : new Set();
    setSelectedItems(newSet);
  };

  const handleSelectItem = (id, checked) => {
    const newSet = new Set(selectedItems);
    checked ? newSet.add(id) : newSet.delete(id);
    setSelectedItems(newSet);
    setSelectAll(newSet.size === data.length);
  };

  const handleDelete = () => {
    if (selectedItems.size === 0) return alert('삭제할 항목을 선택해주세요.');
    if (window.confirm(`${selectedItems.size}개 항목을 삭제하시겠습니까?`)) {
      console.log('삭제:', Array.from(selectedItems));
      setSelectedItems(new Set());
      setSelectAll(false);
    }
  };

  return (
    <div className={styles.container}>
      <CustomerSearchBar onSearch={handleSearch} />

      <div className={styles.tableHeader}>
        <div>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span>전체 선택</span>
        </div>
<div className={styles.deleteButtonWrapper}>
  <button onClick={handleDelete} className={styles.deleteButton}>
    삭제
  </button>
</div>    
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>고객명</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>생년월일</th>
              <th>주소</th>
              <th>제품명</th>
              <th>제품분류</th>
              <th>제조사</th>
              <th>모델코드</th>
              <th>제품고유번호</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.customerId}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.customerId)}
                    onChange={(e) => handleSelectItem(item.customerId, e.target.checked)}
                  />
                </td>
                <td>{item.customerName}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.birth}</td>
                <td>{item.address}</td>
                <td>{item.productName}</td>
                <td>{item.categoryName}</td>
                <td>{item.productBrand}</td>
                <td>{item.modelCode}</td>
                <td>{item.serialNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? styles.activePage : ''}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default CustomerList;
