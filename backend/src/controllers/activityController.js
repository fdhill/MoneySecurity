const activityService = require('../services/activityService');
const { ok } = require('../utils/response');

async function index(req, res, next) {
  try {
    const { activities, total, page, limit } = await activityService.listUnread(
      req.user.sub,
      req.query.page,
      req.query.limit,
    );
    const totalPages = Math.ceil(total / limit);
    ok(
      res,
      {
        data: activities,
        pagination: { page, limit, total, totalPages },
      },
      'activities retrieved successfully',
    );
  } catch (err) {
    next(err);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await activityService.getUnreadCount(req.user.sub);
    ok(res, { count }, 'unread count retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    await activityService.markAsRead(req.user.sub, req.params.id);
    ok(res, null, 'Activity marked as read');
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    const updated = await activityService.markAllAsRead(req.user.sub);
    ok(res, { updated }, 'All activities marked as read');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, unreadCount, markRead, markAllRead };
