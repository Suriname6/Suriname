/**
 * 배송 관리 시스템 통합 Mock 데이터
 * 모든 컴포넌트에서 공통으로 사용하는 Mock 데이터 중앙 관리
 */

// 공통 배송 데이터 (배송목록과 배송조회에서 공유)
export const mockDeliveries = [
  // 배송완료 케이스들
  {
    deliveryId: 1,
    requestNo: "AS-20250801-001",
    customerName: "김민수",
    phone: "010-1234-5678",
    address: "서울특별시 강남구 테헤란로 123",
    carrierName: "CJ대한통운",
    trackingNo: "1234567890123",
    status: "배송완료",
    statusEnum: "DELIVERED",
    createdAt: "2025-08-01T09:30:00",
    completedDate: "2025-08-03T14:20:00"
  },
  {
    deliveryId: 2,
    requestNo: "AS-20250801-002", 
    customerName: "이영희",
    phone: "010-9876-5432",
    address: "부산광역시 해운대구 센텀중앙로 456",
    carrierName: "롯데택배",
    trackingNo: "2345678901234",
    status: "배송완료",
    statusEnum: "DELIVERED",
    createdAt: "2025-08-01T14:15:00",
    completedDate: "2025-08-02T16:45:00"
  },
  {
    deliveryId: 3,
    requestNo: "AS-20250801-003",
    customerName: "박철수",
    phone: "010-5555-6666", 
    address: "대구광역시 수성구 동대구로 789",
    carrierName: "한진택배",
    trackingNo: "3456789012345",
    status: "배송완료",
    statusEnum: "DELIVERED",
    createdAt: "2025-08-01T11:20:00",
    completedDate: "2025-08-04T10:30:00"
  },
  // 배송중 케이스들
  {
    deliveryId: 4,
    requestNo: "AS-20250802-001",
    customerName: "최수진",
    phone: "010-7777-8888",
    address: "인천광역시 연수구 컨벤시아대로 321", 
    carrierName: "CJ대한통운",
    trackingNo: "4567890123456",
    status: "배송중",
    statusEnum: "SHIPPED",
    createdAt: "2025-08-02T08:45:00",
    completedDate: null
  },
  {
    deliveryId: 5,
    requestNo: "AS-20250802-002",
    customerName: "정하나",
    phone: "010-2222-3333",
    address: "광주광역시 서구 상무중앙로 654",
    carrierName: "우체국택배", 
    trackingNo: "5678901234567",
    status: "배송중",
    statusEnum: "SHIPPED",
    createdAt: "2025-08-02T16:30:00",
    completedDate: null
  },
  {
    deliveryId: 6,
    requestNo: "AS-20250803-001",
    customerName: "강도현",
    phone: "010-4444-5555",
    address: "경기도 성남시 분당구 판교역로 987",
    carrierName: "롯데택배",
    trackingNo: "6789012345678", 
    status: "배송중",
    statusEnum: "SHIPPED",
    createdAt: "2025-08-03T12:10:00",
    completedDate: null
  },
  // 배송준비 케이스들
  {
    deliveryId: 7,
    requestNo: "AS-20250804-001",
    customerName: "윤서영",
    phone: "010-6666-7777",
    address: "대전광역시 유성구 대학로 147",
    carrierName: null,
    trackingNo: null,
    status: "배송준비",
    statusEnum: "PENDING", 
    createdAt: "2025-08-04T09:20:00",
    completedDate: null
  },
  {
    deliveryId: 8,
    requestNo: "AS-20250804-002",
    customerName: "임지훈",
    phone: "010-8888-9999",
    address: "울산광역시 남구 삼산로 258",
    carrierName: null,
    trackingNo: null,
    status: "배송준비",
    statusEnum: "PENDING",
    createdAt: "2025-08-04T15:45:00",
    completedDate: null
  },
  {
    deliveryId: 9,
    requestNo: "AS-20250805-001", 
    customerName: "송미라",
    phone: "010-1111-2222",
    address: "경기도 수원시 영통구 월드컵로 369",
    carrierName: null,
    trackingNo: null,
    status: "배송준비",
    statusEnum: "PENDING",
    createdAt: "2025-08-05T10:30:00",
    completedDate: null
  },
  {
    deliveryId: 10,
    requestNo: "AS-20250805-002",
    customerName: "오현수",
    phone: "010-3333-4444",
    address: "제주특별자치도 제주시 중앙로 741",
    carrierName: "한진택배",
    trackingNo: "7890123456789",
    status: "배송중", 
    statusEnum: "SHIPPED",
    createdAt: "2025-08-05T13:15:00",
    completedDate: null
  },
  {
    deliveryId: 11,
    requestNo: "AS-20250805-003",
    customerName: "한예슬",
    phone: "010-9999-0000",
    address: "강원도 춘천시 중앙로 852",
    carrierName: "CJ대한통운",
    trackingNo: "8901234567890",
    status: "배송완료",
    statusEnum: "DELIVERED",
    createdAt: "2025-08-05T08:00:00",
    completedDate: "2025-08-06T11:30:00"
  },
  {
    deliveryId: 12,
    requestNo: "AS-20250806-001",
    customerName: "신동욱",
    phone: "010-5555-7777", 
    address: "충청북도 청주시 상당구 상당로 963",
    carrierName: null,
    trackingNo: null,
    status: "배송준비",
    statusEnum: "PENDING",
    createdAt: "2025-08-06T07:45:00",
    completedDate: null
  }
];

// A/S 접수 Mock 데이터 (배송등록에서 사용)
export const mockRequests = [
  {
    requestId: 1,
    requestNo: "AS-20250801-001",
    customer: { name: "김민수", phone: "010-1234-5678" },
    inputProductName: "삼성 갤럭시 노트20",
    content: "화면 터치가 안되는 문제로 A/S 신청합니다.",
    requestDate: "2025-08-01T10:30:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 2,
    requestNo: "AS-20250801-002", 
    customer: { name: "이영희", phone: "010-9876-5432" },
    inputProductName: "LG 그램 노트북",
    content: "키보드 일부 키가 작동하지 않습니다.",
    requestDate: "2025-08-01T14:20:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 3,
    requestNo: "AS-20250801-003",
    customer: { name: "박철수", phone: "010-5555-6666" },
    inputProductName: "다이슨 헤어드라이기",
    content: "온도 조절이 되지 않는 문제입니다.",
    requestDate: "2025-08-01T16:45:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 4,
    requestNo: "AS-20250802-001",
    customer: { name: "최수진", phone: "010-7777-8888" },
    inputProductName: "아이폰 14 Pro",
    content: "배터리 성능이 급격히 저하되었습니다.",
    requestDate: "2025-08-02T09:15:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 5,
    requestNo: "AS-20250802-002",
    customer: { name: "정하나", phone: "010-2222-3333" },
    inputProductName: "소니 노이즈캔슬링 헤드폰",
    content: "노이즈캔슬링 기능에 문제가 있습니다.",
    requestDate: "2025-08-02T11:30:00", 
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 6,
    requestNo: "AS-20250803-001",
    customer: { name: "강도현", phone: "010-4444-5555" },
    inputProductName: "맥북 프로 M3",
    content: "충전이 되지 않는 문제로 수리 요청드립니다.",
    requestDate: "2025-08-03T13:45:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 7,
    requestNo: "AS-20250804-001",
    customer: { name: "윤서영", phone: "010-6666-7777" },
    inputProductName: "에어팟 프로 2세대", 
    content: "한쪽 이어폰에서 소리가 나지 않습니다.",
    requestDate: "2025-08-04T08:20:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 8,
    requestNo: "AS-20250804-002",
    customer: { name: "임지훈", phone: "010-8888-9999" },
    inputProductName: "삼성 QLED TV 65인치",
    content: "화면에 세로줄이 나타나는 현상입니다.",
    requestDate: "2025-08-04T15:10:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 9,
    requestNo: "AS-20250805-001",
    customer: { name: "송미라", phone: "010-1111-2222" },
    inputProductName: "닌텐도 스위치 OLED",
    content: "조이콘 스틱 드리프트 현상이 심합니다.",
    requestDate: "2025-08-05T12:30:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 10,
    requestNo: "AS-20250805-002",
    customer: { name: "오현수", phone: "010-3333-4444" },
    inputProductName: "iPad Pro 12.9인치", 
    content: "Apple Pencil 인식이 되지 않는 문제입니다.",
    requestDate: "2025-08-05T17:25:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 11,
    requestNo: "AS-20250806-001",
    customer: { name: "한예슬", phone: "010-9999-0000" },
    inputProductName: "비스포크 냉장고 4도어",
    content: "냉동실 온도가 제대로 유지되지 않습니다.",
    requestDate: "2025-08-06T09:30:00",
    status: "WAITING_FOR_DELIVERY"
  },
  {
    requestId: 12,
    requestNo: "AS-20250806-002",
    customer: { name: "신동욱", phone: "010-5555-7777" },
    inputProductName: "갤럭시 워치6 클래식",
    content: "화면이 계속 꺼지고 배터리가 빨리 소모됩니다.",
    requestDate: "2025-08-06T14:10:00",
    status: "WAITING_FOR_DELIVERY"
  }
];

// 배송 분석용 Mock 데이터
export const mockAnalyticsData = {
  totalDeliveries: 1247,
  recentDeliveries: 156,
  pendingCount: 23,
  shippedCount: 89,
  deliveredCount: 1135,
  carrierStats: {
    distribution: {
      'CJ대한통운': 512,
      '롯데택배': 387,
      '한진택배': 234,
      '우체국택배': 114
    },
    topCarrier: 'CJ대한통운'
  },
  performanceMetrics: {
    completionRate: 91.2,
    averageDeliveryTime: 2.3,
    onTimeDeliveryRate: 87.5
  },
  dailyStats: {
    dailyCounts: {
      '08-01': 23,
      '08-02': 19,
      '08-03': 31,
      '08-04': 27,
      '08-05': 35,
      '08-06': 21
    },
    averagePerDay: 26
  },
  regionStats: {
    '서울': 445,
    '경기': 312,
    '부산': 198,
    '대구': 145,
    '인천': 87,
    '광주': 60
  }
};

// 유틸리티 함수들
export const convertDeliveryForTracking = (delivery) => ({
  requestNo: delivery.requestNo,
  customerName: delivery.customerName,
  phone: delivery.phone,
  address: delivery.address,
  carrierName: delivery.carrierName,
  trackingNo: delivery.trackingNo,
  status: delivery.statusEnum,
  createdAt: delivery.createdAt,
  completedDate: delivery.completedDate
});

export const getDeliveryByRequestNo = (requestNo) => {
  const delivery = mockDeliveries.find(d => d.requestNo === requestNo);
  return delivery ? convertDeliveryForTracking(delivery) : null;
};

export const filterDeliveriesByStatus = (status) => {
  if (!status) return mockDeliveries;
  
  const statusMap = {
    "PENDING": "배송준비",
    "SHIPPED": "배송중", 
    "DELIVERED": "배송완료"
  };
  
  return mockDeliveries.filter(delivery => 
    delivery.status === statusMap[status]
  );
};