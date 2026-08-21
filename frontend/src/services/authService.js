import api from './api';

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },
  register(data) {
    return api.post('/auth/register', data);
  },
  me() {
    return api.get('/auth/me');
  },
  updateProfile(data) {
    return api.put('/auth/me', data);
  },
  changePassword(data) {
    return api.put('/auth/me/password', data);
  },
};
