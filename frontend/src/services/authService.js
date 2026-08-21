import api from './api';

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },
  requestOtp(email) {
    return api.post('/auth/request-otp', { email });
  },
  verifyOtp(data) {
    return api.post('/auth/verify-otp', data);
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
