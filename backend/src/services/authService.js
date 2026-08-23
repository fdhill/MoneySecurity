const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const activityService = require('./activityService');
const { sign } = require('../config/jwt');
const {httpError} = require('../utils/helpers');

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw httpError('Invalid email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw httpError('Invalid email or password', 401);

  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const token = sign(payload);

  activityService.log(user.id, 'Login ke aplikasi');

  return { token, user: user.toJSON() };
}

module.exports = { login };
