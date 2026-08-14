const transactionRepository = require('../repositories/transactionRepository');
const walletRepository = require('../repositories/walletRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { assertFound, assertOwnership, httpError } = require('../utils/helpers');

async function applyTransaction(wallet, amount, type) {
  const delta = type === 'expense' ? Number(amount) : -Number(amount);

  if (delta > 0 && Number(wallet.balance) < delta) {
    throw httpError(
      `you don't have enough money in your ${wallet.name} wallet`,
      402,
    );
  }

  return walletRepository.deductBalance(wallet.id, delta);
}

async function reverseTransaction(old_transaction, new_transaction, newWallet) {
  const oldAmt = Number(old_transaction.amount);
  const newAmt = Number(new_transaction.amount);

  const oldEffect = old_transaction.type === 'expense' ? -oldAmt : oldAmt;
  const newEffect = new_transaction.type === 'expense' ? -newAmt : newAmt;
  const delta = newEffect - oldEffect;

  if (old_transaction.wallet_id === new_transaction.wallet_id) {
    if (delta < 0 && Number(newWallet.balance) < -delta) {
      throw httpError(
        `you don't have enough money in your ${newWallet.name} wallet`,
        402,
      );
    }

    return walletRepository.deductBalance(newWallet.id, -delta);
  }

  const oldWallet = await walletRepository.findById(old_transaction.wallet_id);
  await walletRepository.deductBalance(oldWallet.id, oldEffect);

  return applyTransaction(newWallet, newAmt, new_transaction.type);
}

async function getAllTransactions(user, { page, limit, category_id, wallet_id, type, q } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const filters = { page: p, limit: l };
  if (category_id) filters.category_id = category_id;
  if (wallet_id) filters.wallet_id = wallet_id;
  if (type) filters.type = type;
  if (q) filters.q = String(q).trim().slice(0, 100);

  const result =
    user.role == 1
      ? await transactionRepository.findAll(filters)
      : await transactionRepository.findByUserId(user.sub, filters);

  return { transactions: result.rows, total: result.total, page: p, limit: l };
}

async function getTransactionById(id, user) {
  const transaction = await transactionRepository.findById(id);
  assertFound(transaction, id, 'transaction');
  assertOwnership(transaction, user, 'transaction');
  return transaction;
}

async function createTransaction(data, user) {
  const wallet = await walletRepository.findById(data.wallet_id);
  const category = await categoryRepository.findById(data.category_id);

  if (wallet.user_id != user.sub || category.user_id != user.sub) {
    throw httpError(
      'You do not have permission to access this category or wallet',
      403,
    );
  }
  if (category.type != data.type) {
    throw httpError(
      `Category ${category.name} is an ${category.type} category, but transaction type is set to ${data.type}`,
      400,
    );
  }

  await applyTransaction(wallet, data.amount, data.type);

  return transactionRepository.create({
    user_id: user.sub,
    wallet_id: data.wallet_id,
    category_id: data.category_id,
    amount: data.amount,
    type: data.type,
    description: data.description,
    transaction_date:
      data.transaction_date || new Date().toISOString().split('T')[0],
  });
}

async function updateTransaction(id, data, user) {
  const transaction = await transactionRepository.findById(id);
  assertFound(transaction, id, 'transaction');
  assertOwnership(transaction, user, 'transaction');

  const wallet = await walletRepository.findById(data.wallet_id);
  const category = await categoryRepository.findById(data.category_id);

  if (wallet.user_id != user.sub || category.user_id != user.sub) {
    throw httpError(
      'You do not have permission to access this category or wallet',
      403,
    );
  }
  if (category.type != data.type) {
    throw httpError(
      `Category ${category.name} is an ${category.type} category, but transaction type is set to ${data.type}`,
      400,
    );
  }

  await reverseTransaction(transaction, data, wallet);

  const updated = await transactionRepository.update(id, {
    wallet_id: data.wallet_id,
    category_id: data.category_id,
    amount: data.amount,
    type: data.type,
    description: data.description,
    transaction_date:
      data.transaction_date || transaction.transaction_date,
  });
  assertFound(updated, id, 'transaction');
  return updated;
}

async function deleteTransaction(id, user) {
  const transaction = await transactionRepository.findById(id);
  assertFound(transaction, id, 'transaction');
  assertOwnership(transaction, user, 'transaction');

  const deleted = await transactionRepository.remove(id);
  assertFound(deleted, id, 'transaction');
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
