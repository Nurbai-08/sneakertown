import { api, getApiErrorMessage } from './api.js';
import { mapApiUser } from '../../entities/user/model.js';

export const userDataService = {
  async getUserProfile() {
    const { data } = await api.get('/users/me');
    return mapApiUser(data);
  },
  async updateProfile(displayName) {
    const { data } = await api.patch('/users/me', { display_name: displayName });
    return mapApiUser(data);
  },
  async getUserCollection(collectionName) {
    const { data } = await api.get(`/collections/${collectionName}`);
    return data.items || [];
  },
  async saveUserCollection(collectionName, _uid, items) {
    const { data } = await api.put(`/collections/${collectionName}`, { items });
    return data.items || [];
  },
  async createOrder(_uid, payload) {
    const { data } = await api.post('/orders', payload);
    return data;
  },
  async uploadAvatar(_uid, file) {
    const body = new FormData();
    body.append('avatar', file);
    try {
      const { data } = await api.post('/users/me/avatar', body);
      return mapApiUser(data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Ошибка при загрузке фото'));
    }
  },
};
