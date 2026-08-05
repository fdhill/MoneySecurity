const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { sign } = require('../config/jwt');
const {httpError} = require('../utils/helpers');

async function login({ whatsapp_number, password }) {
  const user = await userRepository.findByWhatsappNumber(whatsapp_number);
  if (!user) throw httpError('Invalid number or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw httpError('Invalid number or password', 401);

  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
    number: user.whatsapp_number,
  };

  const token = sign(payload);

  return { token, user: user.toJSON() };
}

module.exports = { login };
