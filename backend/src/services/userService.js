const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const SALT_ROUNDS = 10;

function assertFound(user, id) {
  if (!user) {
    const err = new Error(`User with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

async function getAllUsers() {
  return userRepository.findAll();
}

async function getUserById(id) {
  const user = await userRepository.findById(id);
  assertFound(user, id);
  return user;
}

async function createUser({ name, password, whatsapp_number }) {
  if (!name || !whatsapp_number || !password) {
    const err = new Error('name, password, and whatsapp_number are required');
    err.status = 400;
    throw err;
  }

  const existing = await userRepository.findByWhatsappNumber(whatsapp_number);
  if (existing) {
    const err = new Error('whatsapp_number already used');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return userRepository.create({
    name,
    password: hashedPassword,
    whatsapp_number,
  });
}

async function updateUser(id, { name, whatsapp_number }) {
  if (!name || !whatsapp_number) {
    const err = new Error('name or whatsapp_number are required');
    err.status = 400;
    throw err;
  }

  const user = await userRepository.update(id, { name, whatsapp_number });
  assertFound(user, id);
  return user;
}

async function deleteUser(id) {
  const deleted = await userRepository.remove(id);
  if (!deleted) {
    const err = new Error(`User with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

async function changePassword(id, old_password, new_password) {
  const user = await userRepository.findById(id);
  assertFound(user, id);

  const isMatch = await bcrypt.compare(old_password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid password');
    err.status = 401;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
  return userRepository.changePassword(id, hashedPassword);
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
