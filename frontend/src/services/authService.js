import api from './api';

export const authService = {
  login(whatsapp_number, password) {
    return api.post('/auth/login', { whatsapp_number, password });
  },
  me() {
    return api.get('/auth/me');
  },
};
