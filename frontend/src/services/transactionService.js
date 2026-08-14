import api from './api';

export const transactionService = {
  list(params = {}) {
    return api.get('/transactions', { params });
  },
  getById(id) {
    return api.get(`/transactions/${id}`);
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
  async exportTransactions(params = {}) {
    const res = await api.get('/export', { params, responseType: 'blob' });
    const blob = new Blob([res]);
    if (blob.type.includes('application/json')) {
      const json = JSON.parse(await blob.text());
      throw new Error(json.message || 'Export gagal');
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
