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

  if (data.phone_number) {
    const existing = await userRepository.findByPhoneNumber(
      data.phone_number,
    );
    if (existing) {
      throw httpError('phone number already used', 409);
    }
  }
  const existing = await userRepository.findByEmail(
    data.email,
  );
  if (existing) {
    throw httpError('email already used', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  return userRepository.create({
    name: data.name,
    email: data.email,
    phone_number: data.phone_number,
    password: hashedPassword,
    role: data.role,
  });
}

async function updateUser(id, { name, phone_number }) {
  if (phone_number) {
    const existing = await userRepository.findByPhoneNumber(phone_number);
    if (existing && existing.id !== id) {
      throw httpError('phone number already used', 409);
    }
  }

  const user = await userRepository.update(id, { name, phone_number });
  assertFound(user, id, 'user');
  return user;
}

async function updateProfile(user, { name, phone_number }) {
  if (phone_number) {
    const existing = await userRepository.findByPhoneNumber(phone_number);
    if (existing && existing.id !== user.sub) {
      throw httpError('phone number already used', 409);
    }
  }

  const updated = await userRepository.update(user.sub, {
    name,
    phone_number,
  });
  assertFound(updated, user.sub);
  return updated;
}

async function deleteUser(id) {
  const deleted = await userRepository.remove(id);
  assertFound(deleted, id, 'user');
}

async function changePassword(id, old_password, new_password) {
  const user = await userRepository.findById(id);
  assertFound(user, id, 'user');

  const isMatch = await bcrypt.compare(old_password, user.password);
  if (!isMatch) {
    throw httpError('Invalid password', 401);
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
