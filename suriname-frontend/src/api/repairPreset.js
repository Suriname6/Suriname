import api from './api';

export const getRepairPresets = async () => {
  const response = await api.get('/api/repair-presets');
  return response.data;
};

export const getRepairPresetsByCategory = async (categoryId) => {
  const response = await api.get(`/api/repair-presets/category/${categoryId}`);
  return response.data;
};

export const createRepairPreset = async (presetData) => {
  const response = await api.post('/api/repair-presets', presetData);
  return response.data;
};

export const deleteRepairPreset = async (presetId) => {
  const response = await api.delete(`/api/repair-presets/${presetId}`);
  return response.data;
};