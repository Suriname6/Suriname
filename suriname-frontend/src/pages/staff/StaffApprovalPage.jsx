import React, { useState, useEffect } from "react";
import styles from "../../css/StaffForm.module.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";

const StaffApprovalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId } = useParams();

  const [employee, setEmployee] = useState(location.state || null);
  const [role, setRole] = useState("STAFF");
  const [birth, setBirth] = useState("");

  useEffect(() => {
    if (!employee) {
      axios.get(`/api/users/${employeeId}`)
        .then(res => {
          setEmployee(res.data);
          setBirth(res.data.birth || "");
        })
        .catch(err => {
          console.error("직원 정보 불러오기 실패:", err);
          alert("직원 정보를 불러오지 못했습니다.");
          navigate("/staff/requests");
        });
    } else {
      setBirth(employee.birth || "");
    }
  }, [employeeId, employee, navigate]);

  const handleSubmit = async () => {
    if (!employee) return;

    try {
      await axios.put(`/api/users/${employee.employeeId}/role`, {
        role,
      });
      alert("직원이 성공적으로 등록되었습니다.");
      navigate("/staff/requests");
    } catch (error) {
      console.error("직원 등록 실패:", error);
      alert("직원 등록 중 오류가 발생했습니다.");
    }
  };

  if (!employee) {
    return <div className={styles.loading}>직원 정보를 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>직원 등록</h2>

      <div className={styles.formGroup}>
        <label>직원명</label>
        <input type="text" value={employee.name} disabled />
      </div>

      <div className={styles.formGroup}>
        <label>아이디</label>
        <input type="text" value={employee.loginId || "자동 생성"} disabled />
      </div>

      <div className={styles.formGroup}>
        <label>이메일</label>
        <input type="email" value={employee.email} disabled />
      </div>

      <div className={styles.formGroup}>
        <label>연락처</label>
        <input type="text" value={employee.phone} disabled />
      </div>

      <div className={styles.formGroup}>
        <label>주소</label>
        <input type="text" value={employee.address} disabled />
      </div>

      <div className={styles.formGroup}>
        <label>생년월일</label>
        <input
          type="date"
          value={birth}
          disabled
        />
      </div>

      <div className={styles.formGroup}>
        <label>직원 유형</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="STAFF">일반 직원</option>
          <option value="ENGINEER">수리 기사</option>
        </select>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={() => navigate(-1)} className={styles.cancelButton}>취소</button>
        <button onClick={handleSubmit} className={styles.submitButton}>등록</button>
      </div>
    </div>
  );
};

export default StaffApprovalPage;
