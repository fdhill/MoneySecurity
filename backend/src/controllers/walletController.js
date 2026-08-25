const walletService = require('../services/walletService');
const { ok, created } = require('../utils/response');

async function index(req, res, next) {
  try {
    const wallets = await walletService.getAllWallets(req.user);
    const json = wallets.map((c) => c.toJSON());
    ok(res, json, 'wallets retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const wallet = await walletService.getWalletById(req.params.id, req.user);
    ok(res, wallet.toJSON(), 'wallet retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const wallet = await walletService.createWallet(req.body, req.user);
    created(res, wallet.toJSON(), 'wallet created successfully');
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const wallet = await walletService.updateWallet(
      req.params.id,
      req.body,
      req.user,
    );
    ok(res, wallet.toJSON(), 'wallet updated successfully');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await walletService.deleteWallet(req.params.id, req.user);
    ok(res, null, 'wallet deleted successfully');
  } catch (err) {
    next(err);
  }
}

async function storeTransfer(req, res, next) {
  try {
    const result = await walletService.transferBetweenWallets(req.body, req.user);
    ok(
      res,
      {
        source: result.source.toJSON(),
        destination: result.destination.toJSON(),
      },
      'transfer successful',
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, store, update, destroy, storeTransfer };
