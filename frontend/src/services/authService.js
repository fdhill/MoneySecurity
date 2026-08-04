import api from './api';

export const authService = {
  login(whatsapp_number, password) {
    return api.post('/auth/login', { whatsapp_number, password });
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
