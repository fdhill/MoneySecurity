const categoryRepository = require('../repositories/categoryRepository');
const { assertFound, assertOwnership } = require('../utils/helpers');

async function getAllCategories(user) {
  if (user.role == 1) {
    return categoryRepository.findAll();
  }
  return categoryRepository.findByUserId(user.sub);
}

async function getCategoryById(id, user) {
  const category = await categoryRepository.findById(id);
  assertFound(category, id, 'category');
  assertOwnership(category, user, 'category');
  return category;
}

async function createCategory(data, user) {
  return categoryRepository.create({
    user_id: user.sub,
    name: data.name,
    type: data.type,
  });
}

async function updateCategory(id, data, user) {
  const category = await categoryRepository.findById(id);
  assertFound(category, id, 'category');
  assertOwnership(category, user, 'category');

  const updated = await categoryRepository.update(id, {
    name: data.name,
    type: data.type,
  });
  assertFound(updated, id, 'category');
  return updated;
}

async function deleteCategory(id, user) {
  const category = await categoryRepository.findById(id);
  assertFound(category, id, 'category');
  assertOwnership(category, user, 'category');

  const deleted = await categoryRepository.remove(id);
  assertFound(deleted, id, 'category');
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
