const { body } = require('express-validator');
const Category = require('../models/Category');
const validate = require('../middlewares/validate');

const VALID_TYPES = Object.values(Category.TYPE);

const createCategoryRules = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('type')
    .notEmpty()
    .withMessage('type is required')
    .bail()
    .isIn(VALID_TYPES)
    .withMessage('type must be either expense or income'),
];

const updateCategoryRules = createCategoryRules;

const categoryCreate = [...createCategoryRules, validate];
const categoryUpdate = [...updateCategoryRules, validate];

module.exports = { categoryCreate, categoryUpdate };
