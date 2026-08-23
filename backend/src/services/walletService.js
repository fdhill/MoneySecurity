const walletRepository = require('../repositories/walletRepository');
const activityService = require('./activityService');
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
  const wallet = await walletRepository.create({
    user_id: user.sub,
    name: data.name,
    balance: data.balance || 0,
  });

  activityService.log(user.sub, `Menambahkan dompet ${wallet.name}`);

  return wallet;
}

async function updateWallet(id, data, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id, 'wallet');
  assertOwnership(wallet, user, 'wallet');

  const updated = await walletRepository.update(id, {
    name: data.name,
    balance: data.balance,
  });

  activityService.log(user.sub, `Mengubah dompet ${updated.name}`);

  return updated;
}

async function deleteWallet(id, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id, 'wallet');
  assertOwnership(wallet, user, 'wallet');

  const deleted = await walletRepository.remove(id);
  assertFound(deleted, id, 'wallet');

  activityService.log(user.sub, `Menghapus dompet ${wallet.name}`);
}

module.exports = {
  getAllWallets,
  getWalletById,
  createWallet,
  updateWallet,
  deleteWallet,
};
