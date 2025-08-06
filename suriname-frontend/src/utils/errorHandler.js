/**
 * 통합 에러 처리 유틸리티
 * 모든 컴포넌트에서 일관된 사용자 친화적 에러 메시지 제공
 */

// 에러 타입별 메시지 매핑
const ERROR_MESSAGES = {
  // 네트워크 관련
  NETWORK_ERROR: "인터넷 연결을 확인하고 다시 시도해주세요.",
  
  // API 관련
  API_NOT_FOUND: "요청하신 정보를 찾을 수 없습니다.",
  API_SERVER_ERROR: "서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.",
  
  // 배송 관련
  DELIVERY_REQUEST_NOT_FOUND: "선택한 A/S 접수를 찾을 수 없습니다. 다시 선택해주세요.",
  DELIVERY_ALREADY_EXISTS: "이미 배송이 등록된 접수입니다. 배송목록에서 확인해주세요.",
  DELIVERY_REQUIRED_FIELDS: "필수 정보가 누락되었습니다. 모든 항목을 확인해주세요.",
  DELIVERY_NOT_FOUND: "입력하신 접수번호를 찾을 수 없습니다. 접수번호를 다시 확인해주세요.",
  DELIVERY_INPUT_REQUIRED: "접수번호를 입력해주세요 (예: AS-20250801-001)",
  
  // 택배사 관련
  COURIER_CONNECTION_ERROR: "택배사 홈페이지 연결에 문제가 있습니다. 택배사 앱이나 홈페이지를 직접 이용해주세요.",
  
  // 일반적인 오류
  UNEXPECTED_ERROR: "예상치 못한 문제가 발생했습니다. 페이지를 새로고침 후 다시 시도해주세요.",
  VALIDATION_ERROR: "입력 정보를 확인해주세요."
};

// HTTP 상태 코드별 처리
const handleHttpError = (status, serverMessage = "") => {
  switch (status) {
    case 400:
      if (serverMessage.includes("접수")) {
        return ERROR_MESSAGES.DELIVERY_REQUEST_NOT_FOUND;
      } else if (serverMessage.includes("이미")) {
        return ERROR_MESSAGES.DELIVERY_ALREADY_EXISTS;
      } else if (serverMessage.includes("필수") || serverMessage.includes("입력")) {
        return ERROR_MESSAGES.DELIVERY_REQUIRED_FIELDS;
      } else {
        return `${ERROR_MESSAGES.VALIDATION_ERROR}: ${serverMessage}`;
      }
      
    case 404:
      return ERROR_MESSAGES.API_NOT_FOUND;
      
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.API_SERVER_ERROR;
      
    default:
      return `처리 중 문제가 발생했습니다: ${serverMessage}`;
  }
};

// 메인 에러 처리 함수
export const handleError = (error, context = '') => {
  console.error(`[${context}] 오류:`, error);
  
  if (error.response) {
    // 서버에서 응답이 온 경우
    const { status, data } = error.response;
    const serverMessage = data?.message || "";
    return handleHttpError(status, serverMessage);
    
  } else if (error.request) {
    // 네트워크 연결 문제
    return ERROR_MESSAGES.NETWORK_ERROR;
    
  } else if (error.code === 'VALIDATION_ERROR') {
    // 커스텀 validation 에러
    return error.message;
    
  } else {
    // 기타 에러
    return ERROR_MESSAGES.UNEXPECTED_ERROR;
  }
};

// 특정 컨텍스트별 에러 처리 함수들
export const handleDeliveryRegistrationError = (error) => {
  return handleError(error, '배송등록');
};

export const handleDeliveryTrackingError = (error) => {
  return handleError(error, '배송조회');
};

export const handleDeliveryListError = (error) => {
  return handleError(error, '배송목록');
};

export const handleAnalyticsError = (error) => {
  return handleError(error, '배송분석');
};

// Validation 에러 생성 헬퍼
export const createValidationError = (message) => {
  const error = new Error(message);
  error.code = 'VALIDATION_ERROR';
  return error;
};

// 공통 validation 함수들
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field] || !data[field].toString().trim());
  
  if (missingFields.length > 0) {
    throw createValidationError(ERROR_MESSAGES.DELIVERY_REQUIRED_FIELDS);
  }
};

export const validateRequestNo = (requestNo) => {
  if (!requestNo || !requestNo.trim()) {
    throw createValidationError(ERROR_MESSAGES.DELIVERY_INPUT_REQUIRED);
  }
  
  // 접수번호 형식 체크 (선택적)
  const requestNoPattern = /^AS-\d{8}-\d{3}$/;
  if (!requestNoPattern.test(requestNo.trim())) {
    throw createValidationError("접수번호 형식이 올바르지 않습니다. (예: AS-20250801-001)");
  }
};