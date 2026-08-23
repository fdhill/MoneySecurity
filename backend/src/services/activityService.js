const activityLogRepository = require('../repositories/activityLogRepository');
const logger = require('../utils/logger');
const { httpError } = require('../utils/helpers');

// fire-and-forget: log gagal tidak boleh menggagalkan operasi utama
function log(user_id, description) {
  activityLogRepository
    .insert({ user_id, description })
    .catch((err) => logger.warn({ err }, 'activity log failed'));
}

async function listUnread(user_id, page = 1, limit = 20) {
  const result = await activityLogRepository.findUnreadByUserId(user_id, {
    page,
    limit,
  });
  return { activities: result.rows, total: result.total, page, limit };
}

function getUnreadCount(user_id) {
  return activityLogRepository.countUnreadByUserId(user_id);
}

async function markAsRead(user_id, id) {
  const row = await activityLogRepository.markReadById(id, user_id);
  if (!row) {
    throw httpError('Activity not found', 404);
  }
}

function markAllAsRead(user_id) {
  return activityLogRepository.markAllReadByUserId(user_id);
}

module.exports = { log, listUnread, getUnreadCount, markAsRead, markAllAsRead };
