const categoryRepository = require('../repositories/categoryRepository');

function assertFound(category, id) {
  if (!category) {
    const err = new Error(`category with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

function assertOwnership(category, user) {
  if (user.role != 1 && category.user_id != user.id) {
    const err = new Error('You do not have permission to access this category');
    err.status = 403;
    throw err;
  }
}

async function getAllCategories(user) {
  if (user.role == 1) {
    return categoryRepository.findAll();
  }
  return categoryRepository.findByUserId(user.id);
}

async function getCategoryById(id, user) {
  const category = await categoryRepository.findById(id);
  assertFound(category, id);
  assertOwnership(category, user);
  return category;
}

async function createCategory(data, user) {
  if (!data.name || !data.type) {
    const err = new Error('name and type are required');
    err.status = 400;
    throw err;
  }

  return categoryRepository.create({
    user_id: user.id,
    name: data.name,
    type: data.type,
  });
}

async function updateCategory(id, data, user) {
  if (!data.name) {
    const err = new Error('name is required');
    err.status = 400;
    throw err;
  }

  const category = await categoryRepository.findById(id);
  assertFound(category, id);
  assertOwnership(category, user);

  const updated = await categoryRepository.update(id, { name: data.name });
  assertFound(updated, id);
  return updated;
}

async function deleteCategory(id, user) {
  const category = await categoryRepository.findById(id);
  assertFound(category, id);
  assertOwnership(category, user);

  const deleted = await categoryRepository.remove(id);
  if (!deleted) {
    const err = new Error(`category with id ${id} not found`);
    err.status = 404;
    throw err;
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
