import axiosInstance from './axiosInstance';
import qs from 'qs';

// 견적 목록 조회 (페이징 및 검색)
export const getQuotes = async (params = {}) => {
  try {
    
    const response = await axiosInstance.get('/api/quotes', {
      params,
      paramsSerializer: params => qs.stringify(params, { 
        arrayFormat: 'repeat',
        skipNulls: true 
      }),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// 견적 삭제 (단일)
export const deleteQuote = async (quoteId) => {
  try {
    const response = await axiosInstance.delete(`/api/quotes/${quoteId}`);
    return response.data;
  } catch (error) {
    throw error;
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
    throw error;
  }
};