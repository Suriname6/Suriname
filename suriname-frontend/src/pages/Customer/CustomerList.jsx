import React, { useState, useEffect } from "react";
import styles from "../../css/Customer/CustomerList.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomerSearch from "../../components/Search/CustomerSearch";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import api from "../../api/api";

const CustomerList = () => {
  const [data, setData] = useState([]);
  const [searchConditions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const fetchCustomerData = useCallback(async () => {
    try {
      const response = await api.post(
        "/api/customers/search",
        searchConditions,
        {
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
          },
        }
      );

      const responseData = response.data.data.content;

      const uniqueData = responseData.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.customerId === item.customerId)
      );

      setData(uniqueData);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error("데이터 불러오기 실패:", err);
    }
  }, [currentPage, searchConditions]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const newSet = checked
      ? new Set(data.map((item) => item.customerId))
      : new Set();
    setSelectedItems(newSet);
  };

  const handleSelectItem = (id, checked) => {
    const newSet = new Set(selectedItems);
    checked ? newSet.add(id) : newSet.delete(id);
    setSelectedItems(newSet);
    setSelectAll(newSet.size === data.length);
  };

  const handleDelete = async () => {
    if (selectedItems.size === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    const confirmDelete = window.confirm(
      `${selectedItems.size}개 항목을 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      if (selectedItems.size === 1) {
        // 단건 삭제
        const id = Array.from(selectedItems)[0];
        await api.delete(`/api/customers/delete/${id}`);
        alert("1개 항목이 삭제되었습니다.");
      } else {
        // 다건 삭제
        await api.post("/api/customers/delete", Array.from(selectedItems), {
          headers: {
            "Content-Type": "application/json",
          },
        });
        alert(`${selectedItems.size}개 항목이 삭제되었습니다.`);
      }
      setData((prevData) =>
        prevData.filter((item) => !selectedItems.has(item.customerId))
      );
      setSelectedItems(new Set());
      setSelectAll(false);
      fetchCustomerData();
    } catch (err) {
      console.error("삭제 실패: ", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleRowClick = (customerId, event) => {
    if (event.target.type === "checkbox") {
      return;
    }
    navigate(`/customer/detail/${customerId}`);
  };

  useEffect(() => {
    window._customers = data;
  }, [data]);

  return (
    <div className={styles.container}>
      <CustomerSearch
        setData={setData}
        setTotalPages={setTotalPages}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />

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
              <th>
                <input type="checkbox" />
              </th>
              <th>고객명</th>
              <th>생년월일</th>
              <th>연락처</th>
              <th>이메일</th>
              <th>주소</th>
              <th>제품분류</th>
              <th>제품명</th>
              <th>제조사</th>
              <th>모델코드</th>
              <th>제품고유번호</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={
                    item.serialNumber
                      ? `${item.customerId}-${item.serialNumber}`
                      : `${item.customerId}-index-${index}`
                  }
                  className={styles.clickableRow}
                  onClick={(e) => handleRowClick(item.customerId, e)}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.customerId)}
                      onChange={(e) =>
                        handleSelectItem(item.customerId, e.target.checked)
                      }
                    />
                  </td>
                  <td>{item.customerName}</td>
                  <td>{item.birth}</td>
                  <td>{item.phone}</td>
                  <td>{item.email}</td>
                  <td>{item.address}</td>
                  <td>{item.categoryName || "-"}</td>
                  <td>{item.productName || "-"}</td>
                  <td>{item.productBrand || "-"}</td>
                  <td>{item.modelCode || "-"}</td>
                  <td>{item.serialNumber || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className={styles.emptyState}>
                  <h3>데이터가 없습니다</h3>
                  <p>검색 조건을 변경하거나 새로운 고객을 등록해보세요.</p>
                </td>
              </tr>
            )}
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
            className={currentPage === i + 1 ? styles.activePage : ""}
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
