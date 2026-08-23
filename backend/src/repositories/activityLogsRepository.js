const pool = require('../config/db');
const User = require('../models/ActivityLogs');

async function insert({ user_id, description }) {}
async function findUnreadByUserId(user_id, { limit, offset }) {}

async function countUnreadByUserId(user_id) {}

async function markReadById(id, user_id) {}

async function markAllReadByUserId(user_id) {}

module.exports = {
    insert,
    findUnreadByUserId,
    countUnreadByUserId,
    markReadById,
    markAllReadByUserId
}