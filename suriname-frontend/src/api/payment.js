import axiosInstance from './axiosInstance';
import qs from 'qs';

// 결제 목록 조회 (페이징 및 검색)
export const getPayments = async (params = {}) => {
  try {
    console.log('Calling getPayments with params:', params);
    
    const response = await axiosInstance.get('/api/payments', {
      params,
      paramsSerializer: params => qs.stringify(params, { 
        arrayFormat: 'repeat',
        skipNulls: true 
      }),
    });

    console.log('getPayments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// 결제 삭제 (단일)
export const deletePayment = async (paymentId) => {
  try {
    const response = await axiosInstance.delete(`/api/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// 결제 삭제 (다중)
export const deletePayments = async (paymentIds) => {
  try {
    const response = await axiosInstance.delete('/api/payments', {
      data: paymentIds
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting payments:', error);
    throw error;
  }
};

// 가상계좌 발급
export const createVirtualAccount = async (data) => {
  try {
    const response = await axiosInstance.post('/api/payments/virtual-account', data);
    return response.data;
  } catch (error) {
    console.error('Error creating virtual account:', error);
    throw error;
  }
};