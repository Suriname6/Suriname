import axiosInstance from './axiosInstance';

// 수리 프리셋 목록 조회
export const getRepairPresets = async () => {
  try {
    const response = await axiosInstance.get('/api/repair-presets');
    return response.data;
  } catch (error) {
    console.error('Error fetching repair presets:', error);
    throw error;
  }
};

// 카테고리별 수리 프리셋 조회
export const getRepairPresetsByCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.get(`/api/repair-presets/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching repair presets by category:', error);
    throw error;
  }
};

// 수리 프리셋 생성
export const createRepairPreset = async (presetData) => {
  try {
    console.log('API Call - Creating repair preset:', presetData);
    const response = await axiosInstance.post('/api/repair-presets', presetData);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating repair preset:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // 더 자세한 에러 정보를 포함한 에러 객체 생성
    const enhancedError = new Error(
      error.response?.data?.message || 
      `HTTP ${error.response?.status}: ${error.message}` ||
      '알 수 없는 오류가 발생했습니다'
    );
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    
    throw enhancedError;
  }
};

// 수리 프리셋 삭제
export const deleteRepairPreset = async (presetId) => {
  try {
    const response = await axiosInstance.delete(`/api/repair-presets/${presetId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting repair preset:', error);
    throw error;
  }
};