import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Package } from "lucide-react";
import styles from "../../css/Delivery/DeliveryRegister.module.css";
import { mockRequests } from "../../utils/mockData";
import { handleDeliveryRegistrationError, validateRequiredFields } from "../../utils/errorHandler";

const DeliveryRegister = () => {
  const [formData, setFormData] = useState({
    requestId: "",
    name: "",
    phone: "",
    zipcode: "",
    address: "",
    trackingNo: "",
    carrierName: ""
  });
  const [requestSearch, setRequestSearch] = useState("");
  const [requestList, setRequestList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  const navigate = useNavigate();

  // 택배사 목록
  const carriers = [
    "CJ대한통운",
    "롯데택배",
    "한진택배",
    "로젠택배",
    "우체국택배",
    "GSPostbox",
    "대신택배"
  ];

  useEffect(() => {
    if (showRequestModal) {
      fetchRequestList();
    }
  }, [showRequestModal]);


  const fetchRequestList = async () => {
    try {
      // 실제 API 호출 시도
      const response = await axios.get("/api/requests", {
        params: {
          status: "WAITING_FOR_DELIVERY",
          page: 0,
          size: 20
        }
      });
      setRequestList(response.data.data.content || []);
    } catch (error) {
      console.log("API 호출 실패, Mock 데이터 사용:", error);
      // API 실패시 Mock 데이터 사용
      setRequestList(mockRequests);
    }
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setFormData({
      ...formData,
      requestId: request.requestId,
      name: request.customer?.name || "",
      phone: request.customer?.phone || ""
    });
    setShowRequestModal(false);
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
    
    try {
      // 통합 Validation 사용
      if (!formData.requestId) {
        alert("A/S 접수를 선택해주세요.");
        return;
      }

      validateRequiredFields(formData, ['name', 'phone', 'zipcode', 'address']);

      setLoading(true);
      const response = await axios.post("/api/delivery", formData);
      
      if (response.data.status === 201) {
        alert("배송 정보가 등록되었습니다.");
        navigate("/delivery/list");
      } else {
        alert(response.data.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      // 통합 에러 처리 사용
      const errorMessage = handleDeliveryRegistrationError(error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requestList.filter(request =>
    request.requestNo?.toLowerCase().includes(requestSearch.toLowerCase()) ||
    request.customer?.name?.toLowerCase().includes(requestSearch.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>배송 등록</h1>
        <button 
          className={styles.backButton}
          onClick={() => navigate("/delivery/list")}
        >
          목록으로
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* A/S 접수 선택 */}
        <div className={styles.section}>
          <h2>A/S 접수 정보</h2>
          <div className={styles.requestSelect}>
            <button
              type="button"
              className={styles.selectButton}
              onClick={() => setShowRequestModal(true)}
            >
              <Search size={16} />
              {selectedRequest ? 
                `${selectedRequest.requestNo} - ${selectedRequest.customer?.name}` : 
                "A/S 접수 선택"
              }
            </button>
            {selectedRequest && (
              <div className={styles.selectedRequest}>
                <div><strong>접수번호:</strong> {selectedRequest.requestNo}</div>
                <div><strong>고객명:</strong> {selectedRequest.customer?.name}</div>
                <div><strong>제품:</strong> {selectedRequest.inputProductName}</div>
                <div><strong>접수내용:</strong> {selectedRequest.content}</div>
              </div>
            )}
          </div>
        </div>

        {/* 배송 정보 */}
        <div className={styles.section}>
          <h2>배송 정보</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>수취인 이름 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="수취인 이름"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>연락처 *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-0000-0000"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>우편번호 *</label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleInputChange}
                placeholder="우편번호"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>주소 *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="상세 주소"
                required
              />
            </div>
          </div>
        </div>

        {/* 택배 정보 */}
        <div className={styles.section}>
          <h2>택배 정보 (선택사항)</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>택배사</label>
              <select
                name="carrierName"
                value={formData.carrierName}
                onChange={handleInputChange}
              >
                <option value="">택배사 선택</option>
                {carriers.map(carrier => (
                  <option key={carrier} value={carrier}>{carrier}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>송장번호</label>
              <input
                type="text"
                name="trackingNo"
                value={formData.trackingNo}
                onChange={handleInputChange}
                placeholder="송장번호 (나중에 입력 가능)"
              />
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate("/delivery/list")}
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

      {/* A/S 접수 선택 모달 */}
      {showRequestModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>A/S 접수 선택</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowRequestModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                type="text"
                placeholder="접수번호 또는 고객명으로 검색"
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
              />
            </div>
            
            <div className={styles.requestList}>
              {filteredRequests.length > 0 ? (
                filteredRequests.map(request => (
                  <div
                    key={request.requestId}
                    className={styles.requestItem}
                    onClick={() => handleRequestSelect(request)}
                  >
                    <div className={styles.requestHeader}>
                      <span className={styles.requestNo}>{request.requestNo}</span>
                      <span className={styles.customerName}>{request.customer?.name}</span>
                    </div>
                    <div className={styles.requestInfo}>
                      <div><Package size={14} /> {request.inputProductName}</div>
                      <div>{request.content}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noRequests}>
                  배송 대기 중인 접수가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryRegister;