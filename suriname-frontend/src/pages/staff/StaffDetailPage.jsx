import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import styles from "../../css/StaffForm.module.css";

const StaffDetailPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    axios.get(`/api/users/${employeeId}`)
      .then(res => setEmployee(res.data))
      .catch(err => {
        console.error("직원 정보 불러오기 실패:", err);
        alert("직원 정보를 불러오지 못했습니다.");
        navigate("/staff/list");
      });
  }, [employeeId, navigate]);

  const formatDate = (dateTimeString) => {
    return dateTimeString?.split("T")[0] ?? "";
  };

  if (!employee) {
    return <div className={styles.loading}>직원 정보를 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>직원 상세 정보</h2>

      <div className={styles.formGroup}><label>직원명</label><input type="text" value={employee.name} disabled /></div>
      <div className={styles.formGroup}><label>아이디</label><input type="text" value={employee.loginId} disabled /></div>
      <div className={styles.formGroup}><label>이메일</label><input type="email" value={employee.email} disabled /></div>
      <div className={styles.formGroup}><label>연락처</label><input type="text" value={employee.phone} disabled /></div>
      <div className={styles.formGroup}><label>주소</label><input type="text" value={employee.address} disabled /></div>
      <div className={styles.formGroup}><label>생년월일</label><input type="date" value={employee.birth ?? ""} disabled /></div>
      <div className={styles.formGroup}><label>역할</label><input type="text" value={employee.role} disabled /></div>
      <div className={styles.formGroup}><label>상태</label><input type="text" value={employee.status} disabled /></div>
      <div className={styles.formGroup}><label>계정 생성일</label><input type="text" value={formatDate(employee.createdAt)} disabled /></div>
      <div className={styles.formGroup}><label>계정 수정일</label><input type="text" value={formatDate(employee.updatedAt)} disabled /></div>

      <div className={styles.buttonGroup}>
        <button onClick={() => navigate(-1)} className={styles.cancelButton}>돌아가기</button>
      </div>
    </div>
  );
};

export default StaffDetailPage;
