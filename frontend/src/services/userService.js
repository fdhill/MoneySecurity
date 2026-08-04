import api from './api';

export const userService = {
  list() {
    return api.get('/users');
  },
  getById(id) {
    return api.get(`/users/${id}`);
  },
  create(data) {
    return api.post('/users', data);
  },
  update(id, data) {
    return api.put(`/users/${id}`, data);
  },
  remove(id) {
    return api.delete(`/users/${id}`);
  },
};
