const transactionRepository = require('../repositories/transactionRepository');
const walletRepository = require('../repositories/walletRepository');
const categoryRepository = require('../repositories/categoryRepository');

function assertFound(transaction, id) {
  if (!transaction) {
    const err = new Error(`transaction with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

function assertOwnership(transaction, user) {
  if (user.role != 1 && transaction.user_id != user.sub) {
    const err = new Error(
      'You do not have permission to access this transaction',
    );
    err.status = 403;
    throw err;
  }
}

async function applyTransaction(wallet, amount, type) {
  const delta = type === 'expense' ? Number(amount) : -Number(amount);

  if (delta > 0 && Number(wallet.balance) < delta) {
    const err = new Error(
      `you don't have enough money in your ${wallet.name} wallet`,
    );
    err.status = 402;
    throw err;
  }

  return walletRepository.deductBalance(wallet.id, delta);
}

async function reverseTransaction(old_transaction, new_transaction) {
  const oldAmt = Number(old_transaction.amount);
  const newAmt = Number(new_transaction.amount);

  const oldEffect = old_transaction.type === 'expense' ? -oldAmt : oldAmt;
  const newEffect = new_transaction.type === 'expense' ? -newAmt : newAmt;
  const delta = newEffect - oldEffect;

  if (old_transaction.wallet_id === new_transaction.wallet_id) {
    const wallet = await walletRepository.findById(old_transaction.wallet_id);

    if (delta < 0 && Number(wallet.balance) < -delta) {
      const err = new Error(
        `you don't have enough money in your ${wallet.name} wallet`,
      );
      err.status = 402;
      throw err;
    }

    return walletRepository.deductBalance(wallet.id, -delta);
  }

  const oldWallet = await walletRepository.findById(old_transaction.wallet_id);
  const oldReverse = old_transaction.type === 'expense' ? -oldAmt : oldAmt;
  await walletRepository.deductBalance(oldWallet.id, oldReverse);

  const newWallet = await walletRepository.findById(new_transaction.wallet_id);
  return applyTransaction(newWallet, newAmt, new_transaction.type);
}

async function getAllTransactions(user) {
  if (user.role == 1) {
    return transactionRepository.findAll();
  }
  return transactionRepository.findByUserId(user.sub);
}

async function getTransactionById(id, user) {
  const transaction = await transactionRepository.findById(id);
  assertFound(transaction, id);
  assertOwnership(transaction, user);
  return transaction;
}

async function createTransaction(data, user) {
  if (!data.amount || !data.type || !data.category_id || !data.wallet_id) {
    const err = new Error('category, wallet, amount, and type are required');
    err.status = 400;
    throw err;
  }

  const wallet = await walletRepository.findById(data.wallet_id);
  const category = await categoryRepository.findById(data.category_id);

  if (wallet.user_id != user.sub || category.user_id != user.sub) {
    const err = new Error(
      'You do not have permission to access this category or wallet',
    );
    err.status = 403;
    throw err;
  }
  if (category.type != data.type) {
    const err = new Error(
      `Category ${category.name} is an ${category.type} category, but transaction type is set to ${data.type}`,
    );
    err.status = 400;
    throw err;
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
  if (!data.amount || !data.type || !data.category_id || !data.wallet_id) {
    const err = new Error('category, wallet, amount, and type are required');
    err.status = 400;
    throw err;
  }

  const transaction = await transactionRepository.findById(id);
  assertFound(transaction, id);
  assertOwnership(transaction, user);

  const wallet = await walletRepository.findById(data.wallet_id);
  const category = await categoryRepository.findById(data.category_id);

  if (wallet.user_id != user.sub || category.user_id != user.sub) {
    const err = new Error(
      'You do not have permission to access this category or wallet',
    );
    err.status = 403;
    throw err;
  }
  if (category.type != data.type) {
    const err = new Error(
      `Category ${category.name} is an ${category.type} category, but transaction type is set to ${data.type}`,
    );
    err.status = 400;
    throw err;
  }

  await reverseTransaction(transaction, data);

  const updated = await transactionRepository.update(id, {
    wallet_id: data.wallet_id,
    category_id: data.category_id,
    amount: data.amount,
    type: data.type,
    description: data.description,
  });
  assertFound(updated, id);
  return updated;
}

async function deleteTransaction(id, user) {
  const transaction = await transactionRepository.findById(id);
  assertFound(transaction, id);
  assertOwnership(transaction, user);

  const deleted = await transactionRepository.remove(id);
  if (!deleted) {
    const err = new Error(`transaction with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
