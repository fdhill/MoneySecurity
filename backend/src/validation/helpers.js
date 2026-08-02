function httpError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function assertFound(entity, id, label = 'resource') {
  if (!entity) {
    throw httpError(`${label} with id ${id} not found`, 404);
  }
}

function assertOwnership(entity, user, message) {
  if (user.role != 1 && entity.user_id != user.sub) {
    throw httpError(
      message || 'You do not have permission to access this resource',
      403,
    );
  }
}

module.exports = { httpError, assertFound, assertOwnership };
