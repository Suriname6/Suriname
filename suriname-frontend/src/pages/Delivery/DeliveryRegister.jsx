import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Package } from "lucide-react";
import styles from "../../css/Delivery/DeliveryRegister.module.css";

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

  // URL 파라미터로 전달된 데이터 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('requestId');
    const customerName = urlParams.get('customerName');
    const receptionNumber = urlParams.get('receptionNumber');
    
    if (requestId && customerName && receptionNumber) {
      // 전달된 데이터로 자동 채우기
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
      const response = await axios.get(`/api/requests/${requestId}`);
      
      if (response.data.status === 200) {
        const requestData = response.data.data;
        setSelectedRequest(requestData);
        setFormData({
          ...formData,
          requestId: requestData.requestId,
          name: requestData.customer?.name || customerName,
          phone: requestData.customer?.phone || ""
        });
      }
    } catch (error) {
      console.error('접수 상세 정보 조회 실패:', error);
      // URL 파라미터 데이터로 기본 설정
      setFormData({
        ...formData,
        requestId: requestId,
        name: decodeURIComponent(customerName),
        phone: ""
      });
    }
  };

  // Mock A/S 접수 데이터 (배송 대기 중인 상태)
  const mockRequests = [
    {
      requestId: 1,
      requestNo: "AS-20250801-001",
      customer: {
        name: "김민수",
        phone: "010-1234-5678"
      },
      inputProductName: "삼성 갤럭시 노트20",
      content: "화면 터치가 안되는 문제로 A/S 신청합니다.",
      requestDate: "2025-08-01T10:30:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 2,
      requestNo: "AS-20250801-002",
      customer: {
        name: "이영희",
        phone: "010-9876-5432"
      },
      inputProductName: "LG 그램 노트북 17인치",
      content: "배터리가 충전되지 않아 점검 요청드립니다.",
      requestDate: "2025-08-01T14:20:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 3,
      requestNo: "AS-20250802-001",
      customer: {
        name: "박철수",
        phone: "010-5555-6666"
      },
      inputProductName: "아이폰 15 Pro",
      content: "카메라가 흐리게 나오는 증상이 있습니다.",
      requestDate: "2025-08-02T09:15:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 4,
      requestNo: "AS-20250802-002",
      customer: {
        name: "최수진",
        phone: "010-7777-8888"
      },
      inputProductName: "다이슨 청소기 V15",
      content: "흡입력이 약해지고 이상한 소리가 납니다.",
      requestDate: "2025-08-02T16:45:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 5,
      requestNo: "AS-20250803-001",
      customer: {
        name: "정하나",
        phone: "010-2222-3333"
      },
      inputProductName: "에어팟 프로 2세대",
      content: "좌측 이어폰에서 소리가 나지 않습니다.",
      requestDate: "2025-08-03T11:30:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 6,
      requestNo: "AS-20250803-002",
      customer: {
        name: "강도현",
        phone: "010-4444-5555"
      },
      inputProductName: "MacBook Air M2",
      content: "키보드 스페이스바가 제대로 작동하지 않습니다.",
      requestDate: "2025-08-03T13:50:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 7,
      requestNo: "AS-20250804-001",
      customer: {
        name: "윤서영",
        phone: "010-6666-7777"
      },
      inputProductName: "샤오미 공기청정기",
      content: "필터 교체 후에도 이상한 냄새가 계속 납니다.",
      requestDate: "2025-08-04T08:20:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 8,
      requestNo: "AS-20250804-002",
      customer: {
        name: "임지훈",
        phone: "010-8888-9999"
      },
      inputProductName: "소니 WH-1000XM5 헤드폰",
      content: "노이즈 캔슬링 기능이 작동하지 않습니다.",
      requestDate: "2025-08-04T15:40:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 9,
      requestNo: "AS-20250805-001",
      customer: {
        name: "송미라",
        phone: "010-1111-2222"
      },
      inputProductName: "닌텐도 스위치 OLED",
      content: "화면에 선이 나타나고 터치가 불안정합니다.",
      requestDate: "2025-08-05T12:15:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 10,
      requestNo: "AS-20250805-002",
      customer: {
        name: "오현수",
        phone: "010-3333-4444"
      },
      inputProductName: "iPad Pro 12.9인치",
      content: "Apple Pencil 인식이 되지 않는 문제입니다.",
      requestDate: "2025-08-05T17:25:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 11,
      requestNo: "AS-20250806-001",
      customer: {
        name: "한예슬",
        phone: "010-9999-0000"
      },
      inputProductName: "비스포크 냉장고 4도어",
      content: "냉동실 온도가 제대로 유지되지 않습니다.",
      requestDate: "2025-08-06T09:30:00",
      status: "WAITING_FOR_DELIVERY"
    },
    {
      requestId: 12,
      requestNo: "AS-20250806-002",
      customer: {
        name: "신동욱",
        phone: "010-5555-7777"
      },
      inputProductName: "갤럭시 워치6 클래식",
      content: "화면이 계속 꺼지고 배터리가 빨리 소모됩니다.",
      requestDate: "2025-08-06T14:10:00",
      status: "WAITING_FOR_DELIVERY"
    }
  ];

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
    
    if (!formData.requestId) {
      alert("A/S 접수를 선택해주세요.");
      return;
    }

    if (!formData.name || !formData.phone || !formData.zipcode || !formData.address) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/delivery", formData);
      
      if (response.data.status === 201) {
        alert("배송 정보가 등록되었습니다.");
        navigate("/delivery/list");
      } else {
        alert(response.data.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("배송 등록 실패:", error);
      const errorMessage = error.response?.data?.message || "배송 등록에 실패했습니다.";
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