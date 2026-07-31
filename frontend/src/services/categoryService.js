import api from './api';

export const categoryService = {
  list() {
    return api.get('/categories');
  },
  create(data) {
    return api.post('/categories', data);
  },
  update(id, data) {
    return api.put(`/categories/${id}`, data);
  },
  remove(id) {
    return api.delete(`/categories/${id}`);
  },
};
