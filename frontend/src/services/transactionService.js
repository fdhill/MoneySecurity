import api from './api';

export const transactionService = {
  list() {
    return api.get('/transactions');
  },
  create(data) {
    return api.post('/transactions', data);
  },
  update(id, data) {
    return api.put(`/transactions/${id}`, data);
  },
  remove(id) {
    return api.delete(`/transactions/${id}`);
  },
};
