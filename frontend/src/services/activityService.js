import api from './api';

export const activityService = {
  getActivities({ page = 1, limit = 20 } = {}) {
    return api.get('/activities', { params: { page, limit } });
  },
  getUnreadCount() {
    return api.get('/activities/unread-count');
  },
  markRead(id) {
    return api.patch(`/activities/${id}/read`);
  },
  markAllRead() {
    return api.patch('/activities/read-all');
  },
};
