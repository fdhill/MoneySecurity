const walletRepository = require('../repositories/walletRepository');

function assertFound(wallet, id) {
  if (!wallet) {
    const err = new Error(`wallet with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

function assertOwnership(wallet, user) {
  if (user.role != 1 && wallet.user_id != user.sub) {
    const err = new Error('You do not have permission to access this wallet');
    err.status = 403;
    throw err;
  }
}

async function getAllWallets(user) {
  if (user.role == 1) {
    return walletRepository.findAll();
  }
  return walletRepository.findByUserId(user.sub);
}

async function getWalletById(id, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id);
  assertOwnership(wallet, user);
  return wallet;
}

async function createWallet(data, user) {
  if (!data.name) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }

  return walletRepository.create({
    user_id: user.sub,
    name: data.name,
    balance: data.balance || 0,
  });
}

async function updateWallet(id, data, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id);
  assertOwnership(wallet, user);

  if (!data.name) {
    const updated = await walletRepository.updateBalance(id, {
      balance: data.balance,
    });
    return updated;
  }

  const updated = await walletRepository.update(id, {
    name: data.name,
    balance: data.balance,
  });
  return updated;
}

async function deleteWallet(id, user) {
  const wallet = await walletRepository.findById(id);
  assertFound(wallet, id);
  assertOwnership(wallet, user);

  const deleted = await walletRepository.remove(id);
  if (!deleted) {
    const err = new Error(`wallet with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

module.exports = {
  getAllWallets,
  getWalletById,
  createWallet,
  updateWallet,
  deleteWallet,
};
