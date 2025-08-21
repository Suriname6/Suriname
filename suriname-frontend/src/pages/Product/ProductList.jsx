import React, { useState, useEffect, useCallback } from "react";
import styles from "../../css/Product/ProductList.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductSearch from "../../components/Search/ProductSearch.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const ProductList = () => {
  const [data, setData] = useState([]);
  const [searchConditions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const fetchProductData = useCallback(async () => {
    try {
      const response = await api.post(
        "/api/products/search",
        searchConditions,
        {
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
          },
        }
      );
      setData(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error("데이터 불러오기 실패:", err);
    }
  }, [currentPage, searchConditions]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const newSet = checked
      ? new Set(data.map((item) => item.productId ?? item.objectID))
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
        const id = Array.from(selectedItems)[0];
        await api.delete(`/api/products/delete/${id}`);
        alert("1개 항목이 삭제되었습니다.");
      } else {
        await api.post("/api/products/delete", Array.from(selectedItems), {
          headers: {
            "Content-Type": "application/json",
          },
        });
        alert(`${selectedItems.size}개 항목이 삭제되었습니다.`);
      }
      setData((prevData) =>
        prevData.filter((item) => !selectedItems.has(item.productId))
      );
      setSelectedItems(new Set());
      setSelectAll(false);
      fetchProductData();
    } catch (err) {
      console.error("삭제 실패: ", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleRowClick = (productId, event) => {
    if (event.target.type === "checkbox") return;
    navigate(`/product/detail/${productId}`);
  };

  const [searchVisible, setSearchVisible] = useState(true);
  const toggleSearchVisible = useCallback(() => {
    setSearchVisible((v) => !v);
  }, []);

  return (
    <div className={styles.container}>
      {!searchVisible ? (
        <div className={styles.searchToggle}>
          <button
            className={styles.searchToggleBtn}
            onClick={toggleSearchVisible}
          >
            검색 조건
          </button>
        </div>
      ) : (
        <div className={styles.searchWrap}>
          <div className={styles.searchCloseBtn}>
            <button onClick={toggleSearchVisible}>검색 조건 닫기</button>
          </div>
        </div>
      )}
      <ProductSearch
        data={data}
        setData={setData}
        setTotalPages={setTotalPages}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
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
              <th>제조사</th>
              <th>제품분류</th>
              <th>제품명</th>
              <th>모델코드</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr
                  key={item.productId || item.objectID || `fallback-${index}`}
                  className={styles.clickableRow}
                  onClick={(e) =>
                    handleRowClick(item.productId || item.objectID, e)
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(
                        item.productId || item.objectID
                      )}
                      onChange={(e) =>
                        handleSelectItem(
                          item.productId || item.objectID,
                          e.target.checked
                        )
                      }
                    />
                  </td>
                  <td>{item.productBrand}</td>
                  <td>{item.categoryName}</td>
                  <td>{item.productName}</td>
                  <td>{item.modelCode}</td>
                  <td>{item.memo || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.emptyState}>
                  <h3>데이터가 없습니다</h3>
                  <p>검색 조건을 변경하거나 새로운 제품을 등록해보세요.</p>
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

export default ProductList;
