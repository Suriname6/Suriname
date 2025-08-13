import axiosInstance from './axiosInstance';
import qs from 'qs';

// 공통 에러 핸들러
const handleApiError = (error, context) => {
  // 콘솔에 API 호출 정보 + 에러 로그
  console.error(`[API ERROR] ${context}`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    config: error.config
  });

  // 사용자/호출 측에 전달할 통일된 에러 객체
  throw {
    status: error.response?.status || 500,
    message:
      error.response?.data?.message ||
      error.message ||
      `${context} 처리 중 오류가 발생했습니다.`,
    raw: error 
  };
};

// 견적 목록 조회 (페이징 및 검색)
export const getQuotes = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/quotes', {
      params,
      paramsSerializer: params =>
        qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true }),
    });
    return response.data;
  } catch (error) {
    handleApiError(error, '견적 목록 조회');
  }
};

// 견적 삭제 (단일)
export const deleteQuote = async (quoteId) => {
  try {
    const response = await axiosInstance.delete(`/api/quotes/${quoteId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, '견적 삭제');
  }
};

// 견적 삭제 (다중)
export const deleteQuotes = async (quoteIds) => {
  try {
    const response = await axiosInstance.delete('/api/quotes', {
      data: quoteIds
    });
    return response.data;
  } catch (error) {
    handleApiError(error, '견적 다중 삭제');
  }
};
