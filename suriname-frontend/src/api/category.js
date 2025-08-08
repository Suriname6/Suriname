import axiosInstance from './axiosInstance';

// 카테고리 목록 조회
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};