const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { assertFound, httpError } = require('../utils/helpers');

const SALT_ROUNDS = 10;

async function getAllUsers() {
  return userRepository.findAll();
}

async function getUserById(id) {
  const user = await userRepository.findById(id);
  assertFound(user, id, 'user');
  return user;
}

async function createUser(data, user) {
  if (!user || user.role != 1) {
    data.role = 2;
  }

  const existing = await userRepository.findByWhatsappNumber(
    data.whatsapp_number,
  );
  if (existing) {
    httpError('whatsapp_number already used', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  return userRepository.create({
    name: data.name,
    whatsapp_number: data.whatsapp_number,
    password: hashedPassword,
    role: data.role,
  });
}

async function updateUser(id, { name, whatsapp_number }) {
  const user = await userRepository.update(id, { name, whatsapp_number });
  assertFound(user, id, 'user');
  return user;
}

async function updateProfile(user, { name, whatsapp_number }) {
  const updated = await userRepository.update(user.sub, {
    name,
    whatsapp_number,
  });
  assertFound(updated, user.sub);
  return updated;
}

async function deleteUser(id) {
  const deleted = await userRepository.remove(id);
  if (!deleted) {
    httpError(`User with id ${id} not found`, 404);
  }
}

async function changePassword(id, old_password, new_password) {
  const user = await userRepository.findById(id);
  assertFound(user, id, 'user');

  const isMatch = await bcrypt.compare(old_password, user.password);
  if (!isMatch) {
    httpError('Invalid password', 401);
  }

  const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
  return userRepository.changePassword(id, hashedPassword);
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateProfile,
  deleteUser,
  changePassword,
};
