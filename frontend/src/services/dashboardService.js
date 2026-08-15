import api from './api';

export const dashboardService = {
  get() {
    return api.get('/dashboard');
  },
};
