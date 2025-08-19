import instance from './axiosInstance';

export const getRepairPresets = async () => {
  const response = await instance.get('/api/repair-presets');
  return response.data;
};

export const getRepairPresetsByCategory = async (categoryId) => {
  const response = await instance.get(`/api/repair-presets/category/${categoryId}`);
  return response.data;
};

export const createRepairPreset = async (presetData) => {
  const response = await instance.post('/api/repair-presets', presetData);
  return response.data;
};

export const deleteRepairPreset = async (presetId) => {
  const response = await instance.delete(`/api/repair-presets/${presetId}`);
  return response.data;
};
