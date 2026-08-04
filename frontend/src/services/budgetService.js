import api from './api';

export const budgetService = {
  list() {
    return api.get('/budgets');
  },
  getById(id) {
    return api.get(`/budgets/${id}`);
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
  getActiveInstance(id) {
    return api.get(`/budgets/${id}/instance`);
  },
  getInstanceSummary(instanceId) {
    return api.get(`/budgets/instances/${instanceId}/summary`);
  },
};
