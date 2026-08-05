const walletRepository = require('../repositories/walletRepository');
const { assertFound, assertOwnership } = require('../utils/helpers');

async function getAllWallets(user) {
  if (user.role == 1) {
    return walletRepository.findAll();
  }
  return walletRepository.findByUserId(user.sub);
}

async function getWalletById(id, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id, 'wallet');
  assertOwnership(wallet, user, 'wallet');
  return wallet;
}

async function createWallet(data, user) {
  return walletRepository.create({
    user_id: user.sub,
    name: data.name,
    balance: data.balance || 0,
  });
}

async function updateWallet(id, data, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id, 'wallet');
  assertOwnership(wallet, user, 'wallet');

  const updated = await walletRepository.update(id, {
    name: data.name,
    balance: data.balance,
  });
  return updated;
}

async function deleteWallet(id, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id, 'wallet');
  assertOwnership(wallet, user, 'wallet');

  const deleted = await walletRepository.remove(id);
  assertFound(deleted, id, 'wallet');
}

module.exports = {
  getAllWallets,
  getWalletById,
  createWallet,
  updateWallet,
  deleteWallet,
};
