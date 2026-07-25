const transactionService = require('../services/transactionService');
const { ok, created } = require('../utils/response');

async function index(req, res, next) {
  try {
    const transactions = await transactionService.getAllTransactions(req.user);
    const json = transactions.map((c) => c.toJSON());
    ok(res, json, 'transactions retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id,
      req.user,
    );
    ok(res, transaction.toJSON(), 'transaction retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const transaction = await transactionService.createTransaction(req.body, req.user);
    created(res, transaction.toJSON(), 'transaction created successfully');
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.body,
      req.user,
    );
    ok(res, transaction.toJSON(), 'transaction updated successfully');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await transactionService.deleteTransaction(req.params.id, req.user);
    ok(res, null, 'transaction deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, store, update, destroy };
