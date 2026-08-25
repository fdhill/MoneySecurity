const walletRepository = require('../repositories/walletRepository');
const activityService = require('./activityService');
const { assertFound, assertOwnership, httpError } = require('../utils/helpers');

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

async function transferBetweenWallets(data, user) {
  const source = await walletRepository.findById(data.source_wallet_id);
  const destination = await walletRepository.findById(
    data.destination_wallet_id,
  );
  assertFound(source, data.source_wallet_id, 'wallet');
  assertFound(destination, data.destination_wallet_id, 'wallet');

  // transfer hanya antar wallet milik sendiri, admin pun tidak dikecualikan
  if (source.user_id != user.sub || destination.user_id != user.sub) {
    throw httpError('You can only transfer between your own wallets', 403);
  }
  if (source.id === destination.id) {
    throw httpError('Source and destination wallets must be different', 400);
  }

  const result = await walletRepository.transferBalance(
    source.id,
    destination.id,
    data.amount,
  );
  if (!result) {
    throw httpError(
      `you don't have enough money in your ${source.name} wallet`,
      402,
    );
  }

  activityService.log(
    user.sub,
    `Transfer Rp${Number(data.amount).toLocaleString('id-ID')} dari ${source.name} ke ${destination.name}`,
  );

  return result;
}

module.exports = {
  getAllWallets,
  getWalletById,
  createWallet,
  updateWallet,
  deleteWallet,
  transferBetweenWallets,
};
