const categoryService = require('../services/categoryService');
const { ok, created } = require('../utils/response');

async function index(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories(req.user);
    ok(res, categories, 'categories retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(
      req.params.id,
      req.user,
    );
    ok(res, category, 'category retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function store(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body, req.user);
    created(res, category, 'category created successfully');
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
      req.user,
    );
    ok(res, category, 'category updated successfully');
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id, req.user);
    ok(res, null, 'category deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { index, show, store, update, destroy };
