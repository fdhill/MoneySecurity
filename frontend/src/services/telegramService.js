import api from './api';

export const telegramService = {
  generateLinkToken() {
    return api.post('/auth/me/telegram/link-token');
  },
  getStatus() {
    return api.get('/auth/me/telegram/status');
  },
};
