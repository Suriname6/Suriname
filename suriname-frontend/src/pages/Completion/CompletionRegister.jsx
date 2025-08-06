import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Package, User, CheckCircle } from "lucide-react";
import styles from "../../css/Completion/CompletionRegister.module.css";

const CompletionRegister = () => {
  const [formData, setFormData] = useState({
    deliveryId: "",
    employeeId: "",
    completionType: "",
    completionNotes: ""
  });
  const [deliverySearch, setDeliverySearch] = useState("");
  const [deliveryList, setDeliveryList] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  
  const navigate = useNavigate();

  // 완료 타입 옵션
  const completionTypes = [
    { value: "REPAIR_COMPLETED", label: "수리 완료" },
    { value: "EXCHANGE_COMPLETED", label: "교체 완료" },
    { value: "REFUND_COMPLETED", label: "환불 완료" },
    { value: "RETURN_COMPLETED", label: "반품 완료" },
    { value: "INSPECTION_COMPLETED", label: "점검 완료" }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (showDeliveryModal) {
      fetchDeliveryList();
    }
  }, [showDeliveryModal]);

  const fetchEmployees = async () => {
    try {
      // 직원 목록 조회 API (예시)
      const response = await axios.get("/api/employees");
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("직원 목록 조회 실패:", error);
      // 임시 직원 데이터
      setEmployees([
        { employeeId: 1, name: "김기사" },
        { employeeId: 2, name: "이엔지니어" },
        { employeeId: 3, name: "박매니저" }
      ]);
    }
  };

  const fetchDeliveryList = async () => {
    try {
      // 배송완료 상태의 배송 목록 조회
      const response = await axios.get("/api/delivery", {
        params: {
          status: "DELIVERED",
          page: 0,
          size: 20
        }
      });
      setDeliveryList(response.data.data.content || []);
    } catch (error) {
      console.error("배송 목록 조회 실패:", error);
      alert("배송 목록을 불러오는데 실패했습니다.");
    }
  };

  const handleDeliverySelect = (delivery) => {
    setSelectedDelivery(delivery);
    setFormData({
      ...formData,
      deliveryId: delivery.deliveryId
    });
    setShowDeliveryModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.deliveryId) {
      alert("배송 정보를 선택해주세요.");
      return;
    }

    if (!formData.employeeId) {
      alert("담당자를 선택해주세요.");
      return;
    }

    if (!formData.completionType) {
      alert("완료 타입을 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/completion", formData);
      
      if (response.data.status === 201) {
        alert("완료 처리가 등록되었습니다.");
        navigate("/completion/list");
      } else {
        alert(response.data.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("완료 처리 등록 실패:", error);
      const errorMessage = error.response?.data?.message || "완료 처리 등록에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveryList.filter(delivery =>
    delivery.requestNo?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.customerName?.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>완료 처리 등록</h1>
        <button 
          className={styles.backButton}
          onClick={() => navigate("/completion/list")}
        >
          목록으로
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 배송 정보 선택 */}
        <div className={styles.section}>
          <h2>배송 정보</h2>
          <div className={styles.deliverySelect}>
            <button
              type="button"
              className={styles.selectButton}
              onClick={() => setShowDeliveryModal(true)}
            >
              <Search size={16} />
              {selectedDelivery ? 
                `${selectedDelivery.requestNo} - ${selectedDelivery.customerName}` : 
                "배송 완료 건 선택"
              }
            </button>
            {selectedDelivery && (
              <div className={styles.selectedDelivery}>
                <div><strong>접수번호:</strong> {selectedDelivery.requestNo}</div>
                <div><strong>고객명:</strong> {selectedDelivery.customerName}</div>
                <div><strong>배송주소:</strong> {selectedDelivery.address}</div>
                <div><strong>배송완료일:</strong> {new Date(selectedDelivery.completedDate).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* 완료 처리 정보 */}
        <div className={styles.section}>
          <h2>완료 처리 정보</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>담당자 *</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                required
              >
                <option value="">담당자 선택</option>
                {employees.map(employee => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>완료 타입 *</label>
              <select
                name="completionType"
                value={formData.completionType}
                onChange={handleInputChange}
                required
              >
                <option value="">완료 타입 선택</option>
                {completionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>완료 메모</label>
            <textarea
              name="completionNotes"
              value={formData.completionNotes}
              onChange={handleInputChange}
              placeholder="완료 처리에 대한 상세 내용을 입력하세요."
              rows={4}
            />
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate("/completion/list")}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>

      {/* 배송 선택 모달 */}
      {showDeliveryModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>배송 완료 건 선택</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowDeliveryModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                type="text"
                placeholder="접수번호 또는 고객명으로 검색"
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
              />
            </div>
            
            <div className={styles.deliveryList}>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map(delivery => (
                  <div
                    key={delivery.deliveryId}
                    className={styles.deliveryItem}
                    onClick={() => handleDeliverySelect(delivery)}
                  >
                    <div className={styles.deliveryHeader}>
                      <span className={styles.requestNo}>{delivery.requestNo}</span>
                      <span className={styles.customerName}>{delivery.customerName}</span>
                    </div>
                    <div className={styles.deliveryInfo}>
                      <div><Package size={14} /> {delivery.address}</div>
                      <div><CheckCircle size={14} /> 완료: {new Date(delivery.completedDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noDeliveries}>
                  배송 완료 건이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletionRegister;