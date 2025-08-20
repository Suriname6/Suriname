import instance from './axiosInstance';

export const getCategories = async () => {
  const response = await instance.get('/api/categories');
  return response.data;
};
