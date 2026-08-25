import api from './api';

export const walletService = {
  list() {
    return api.get('/wallets');
  },
  getById(id) {
    return api.get(`/wallets/${id}`);
  },
  create(data) {
    return api.post('/wallets', data);
  },
  update(id, data) {
    return api.put(`/wallets/${id}`, data);
  },
  remove(id) {
    return api.delete(`/wallets/${id}`);
  },
  transfer(data) {
    return api.post('/wallets/transfer', data);
  },
};
