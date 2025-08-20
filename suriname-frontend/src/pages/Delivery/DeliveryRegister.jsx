import React, { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Search, Package } from "lucide-react";
import styles from "../../css/Delivery/DeliveryRegister.module.css";

const DeliveryRegister = () => {
  const [formData, setFormData] = useState({
    requestId: "",
    name: "",
    phone: "",
    address: "",
    trackingNo: "",
    carrierName: "",
  });
  const [requestSearch, setRequestSearch] = useState("");
  const [requestList, setRequestList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const navigate = useNavigate();

  const carriers = [
    "CJ대한통운",
    "롯데택배",
    "한진택배",
    "로젠택배",
    "우체국택배",
    "GSPostbox",
    "대신택배",
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get("requestId");
    const customerName = urlParams.get("customerName");
    const receptionNumber = urlParams.get("receptionNumber");

    if (requestId && customerName && receptionNumber) {
      fetchRequestDetail(requestId, customerName, receptionNumber);
    }
  }, []);

  useEffect(() => {
    if (showRequestModal) {
      fetchRequestList();
    }
  }, [showRequestModal]);

  const fetchRequestDetail = async (requestId, customerName, receptionNumber) => {
    try {
      const response = await api.get(`/api/requests/${requestId}`);
      if (response.data.status === 200) {
        const requestData = response.data.data;
        setSelectedRequest(requestData);
        setFormData({
          ...formData,
          requestId: requestData.requestId,
          name: requestData.customerName || customerName,
          phone: requestData.phone || "",
          address: requestData.address || "",
        });
      }
    } catch (error) {
      console.error("접수 상세 정보 조회 실패:", error);
      setFormData({
        ...formData,
        requestId: requestId,
        name: decodeURIComponent(customerName),
        phone: "",
      });
    }
  };

  const fetchRequestList = async () => {
    try {
      const response = await api.get("/api/requests", {
        params: {
          status: "WAITING_FOR_DELIVERY",
          page: 0,
          size: 20,
        },
      });
      setRequestList(response.data.content || []);
    } catch (error) {
      console.error("A/S 접수 목록 조회 실패:", error);
      setRequestList([]);
    }
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setFormData({
      ...formData,
      requestId: request.requestId,
      name: request.customerName || "",
      phone: request.phone || "",
      address: request.address || "",
    });
    setShowRequestModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.requestId) {
      alert("A/S 접수를 선택해주세요.");
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      let response;

      // zipcode 기본값 추가
      const payload = {
        ...formData,
        zipcode: "00000",
      };

      if (!selectedRequest?.deliveryId) {
        response = await api.post("/api/delivery", payload);
      } else {
        response = await api.put(
          `/api/delivery/${selectedRequest.deliveryId}/tracking`,
          {
            trackingNo: formData.trackingNo,
            carrierName: formData.carrierName,
            zipcode: "00000",
          }
        );
      }

      if (response.data.status === 200 || response.data.status === 201) {
        alert("배송 정보가 등록되었습니다.");
        navigate("/delivery/list");
      } else {
        alert(response.data.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("배송 등록 실패:", error);
      const errorMessage =
        error.response?.data?.message || "배송 등록에 실패했습니다.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requestList.filter(
    (request) =>
      request.requestNo?.toLowerCase().includes(requestSearch.toLowerCase()) ||
      request.customerName?.toLowerCase().includes(requestSearch.toLowerCase())
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
        <div className={styles.section}>
          <h2>A/S 접수 정보</h2>
          <div className={styles.requestSelect}>
            <button
              type="button"
              className={styles.selectButton}
              onClick={() => setShowRequestModal(true)}
            >
              <Search size={16} />
              {selectedRequest
                ? `${selectedRequest.requestNo} - ${selectedRequest.customerName}`
                : "A/S 접수 선택"}
            </button>
            {selectedRequest && (
              <div className={styles.selectedRequest}>
                <div>
                  <strong>접수번호:</strong> {selectedRequest.requestNo}
                </div>
                <div>
                  <strong>고객명:</strong> {selectedRequest.customerName}
                </div>
                <div>
                  <strong>제품:</strong> {selectedRequest.productName} (
                  {selectedRequest.modelCode})
                </div>
              </div>
            )}
          </div>
        </div>

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
                {carriers.map((carrier) => (
                  <option key={carrier} value={carrier}>
                    {carrier}
                  </option>
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
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>

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
                filteredRequests.map((request) => (
                  <div
                    key={request.requestId}
                    className={styles.requestItem}
                    onClick={() => handleRequestSelect(request)}
                  >
                    <div className={styles.requestHeader}>
                      <span className={styles.requestNo}>
                        {request.requestNo}
                      </span>
                      <span className={styles.customerName}>
                        {request.customerName}
                      </span>
                    </div>
                    <div className={styles.requestInfo}>
                      <div>
                        <Package size={14} /> {request.productName} (
                        {request.modelCode})
                      </div>
                      <div>{request.status}</div>
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
