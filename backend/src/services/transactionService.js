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
  if (user.role != 1 && transaction.user_id != user.id) {
    const err = new Error(
      'You do not have permission to access this transaction',
    );
    err.status = 403;
    throw err;
  }
}

async function getAllTransactions(user) {
  if (user.role == 1) {
    return transactionRepository.findAll();
  }
  return transactionRepository.findByUserId(user.id);
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

  if (wallet.user_id != user.id || category.user_id != user.id) {
    const err = new Error(
      'You do not have permission to access this category or wallet',
    );
    err.status = 403;
    throw err;
  }

  return transactionRepository.create({
    user_id: user.id,
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

  if (wallet.user_id != user.id || category.user_id != user.id) {
    const err = new Error(
      'You do not have permission to access this category or wallet',
    );
    err.status = 403;
    throw err;
  }

  const updated = await transactionRepository.update(id, {
    wallet_id: data.wallet_id,
    category_id: data.category_id,
    amount: data.amount,
    type: data.type,
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
