import api from './api';

export const walletService = {
  list() {
    return api.get('/wallets');
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
};
