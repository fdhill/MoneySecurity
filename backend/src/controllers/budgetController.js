const budgetService = require('../services/budgetService');
const { ok, created } = require('../utils/response');

async function indexTemplates(req, res, next) {
  try {
    const templates = await budgetService.getAllTemplates(req.user);
    const json = templates.map((t) => t.toJSON());
    ok(res, json, 'budget templates retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function showTemplate(req, res, next) {
  try {
    const template = await budgetService.getTemplateById(
      req.params.id,
      req.user,
    );
    ok(res, template.toJSON(), 'budget template retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function storeTemplate(req, res, next) {
  try {
    const template = await budgetService.createTemplate(req.body, req.user);
    created(res, template.toJSON(), 'budget template created successfully');
  } catch (err) {
    next(err);
  }
}

async function updateTemplate(req, res, next) {
  try {
    const template = await budgetService.updateTemplate(
      req.params.id,
      req.body,
      req.user,
    );
    ok(res, template.toJSON(), 'budget template updated successfully');
  } catch (err) {
    next(err);
  }
}

async function destroyTemplate(req, res, next) {
  try {
    await budgetService.deleteTemplate(req.params.id, req.user);
    ok(res, null, 'budget template deleted successfully');
  } catch (err) {
    next(err);
  }
}

async function activeInstance(req, res, next) {
  try {
    const instance = await budgetService.getActiveInstance(
      req.params.id,
      req.user,
    );
    ok(res, instance.toJSON(), 'budget instance retrieved successfully');
  } catch (err) {
    next(err);
  }
}

async function instanceSummary(req, res, next) {
  try {
    const summary = await budgetService.getInstanceSummary(
      req.params.id,
      req.user,
    );
    ok(res, summary, 'budget summary retrieved successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  indexTemplates,
  showTemplate,
  storeTemplate,
  updateTemplate,
  destroyTemplate,
  activeInstance,
  instanceSummary,
};
