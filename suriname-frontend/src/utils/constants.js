/**
 * 배송 관리 시스템 상수 정의
 * 모든 컴포넌트에서 일관된 상태 매핑과 설정 사용
 */

// 배송 상태 매핑
export const DELIVERY_STATUS = {
  // Backend Enum -> Frontend 표시
  PENDING: "배송준비",
  SHIPPED: "배송중", 
  DELIVERED: "배송완료"
};

// Frontend 표시 -> Backend Enum (역방향)
export const DELIVERY_STATUS_REVERSE = {
  "배송준비": "PENDING",
  "배송중": "SHIPPED",
  "배송완료": "DELIVERED"
};

// 상태별 CSS 클래스 매핑
export const DELIVERY_STATUS_CLASSES = {
  PENDING: "statusPending",
  SHIPPED: "statusShipped",
  DELIVERED: "statusDelivered"
};

// API 응답 상태 코드
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// 페이지네이션 설정
export const PAGINATION = {
  DEFAULT_SIZE: 10,
  MAX_SIZE: 50
};

// 접수번호 포맷 정규식
export const REQUEST_NO_PATTERN = /^AS-\d{8}-\d{3}$/;

// 날짜 포맷
export const DATE_FORMAT = {
  DISPLAY: "YYYY-MM-DD",
  DATETIME: "YYYY-MM-DD HH:mm:ss"
};