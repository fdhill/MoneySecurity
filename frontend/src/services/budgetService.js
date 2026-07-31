import api from './api';

export const budgetService = {
  list() {
    return api.get('/budgets');
  },
  create(data) {
    return api.post('/budgets', data);
  },
  update(id, data) {
    return api.put(`/budgets/${id}`, data);
  },
  remove(id) {
    return api.delete(`/budgets/${id}`);
  },
};
