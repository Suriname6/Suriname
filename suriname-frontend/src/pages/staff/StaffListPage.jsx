import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import styles from "../../css/StaffList.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StaffSearchBar from "./StaffSearchBar";

const StaffListPage = () => {
  const [data, setData] = useState([]);
  const [searchConditions, setSearchConditions] = useState({
    name: "",
    loginId: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStaffData(searchConditions);
  }, [currentPage, searchConditions]);

  const fetchStaffData = async (conditions) => {
    try {
      console.log("axios 요청 params:", {
        ...conditions,
        page: currentPage - 1,
        size: itemsPerPage,
      });

      const res = await axios.get("/api/users", {
        params: {
          ...conditions,
          page: currentPage - 1,
          size: itemsPerPage,
        },
      });

      setData(res.data.content);
      setTotalPages(res.data.totalPages);
      setSelectAll(false);
      setSelectedItems(new Set());
    } catch (err) {
      console.error("직원 목록 불러오기 실패:", err);
    }
  };

  const handleSearch = (searchData) => {
    setSearchConditions(searchData);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const newSet = checked ? new Set(data.map((item) => item.employeeId)) : new Set();
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

    const confirm = window.confirm(`${selectedItems.size}개 항목을 삭제하시겠습니까?`);
    if (!confirm) return;

    try {
      const ids = Array.from(selectedItems);
      for (const id of ids) {
        await axios.delete(`/api/users/${id}`);
      }

      alert(`${ids.length}개 항목이 삭제되었습니다.`);
      fetchStaffData(searchConditions);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleRowClick = (employeeId, event) => {
    if (event.target.type === "checkbox") return;
    navigate(`/staff/detail/${employeeId}`);
  };

  const formatDate = (dateTimeString) => {
    return dateTimeString?.split("T")[0] ?? "";
  };

  return (
    <div className={styles.container}>
      <StaffSearchBar onSearch={handleSearch} />

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
              <th></th>
              <th>직원명</th>
              <th>로그인ID</th>
              <th>이메일</th>
              <th>연락처</th>
              <th>생년월일</th>
              <th>계정생성일</th>
              <th>계정수정일</th>
              <th>계정상태</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.employeeId}
                  className={styles.clickableRow}
                  onClick={(e) => handleRowClick(item.employeeId, e)}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.employeeId)}
                      onChange={(e) => handleSelectItem(item.employeeId, e.target.checked)}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.loginId}</td>
                  <td>{item.email}</td>
                  <td>{item.phone}</td>
                  <td>{item.birth}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                  <td>{item.status === "ACTIVE" ? "활성" : "비활성"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className={styles.emptyState}>
                  <h3>데이터가 없습니다</h3>
                  <p>검색 조건을 변경하거나 새로운 직원을 등록해보세요.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
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
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default StaffListPage;
