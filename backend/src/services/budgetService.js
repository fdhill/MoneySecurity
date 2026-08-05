const budgetTemplateRepository = require('../repositories/budgetTemplateRepository');
const budgetInstanceRepository = require('../repositories/budgetInstanceRepository');
const transactionRepository = require('../repositories/transactionRepository');
const { assertFound, assertOwnership, httpError } = require('../utils/helpers');

function calculatePeriod(frequency) {
  const now = new Date();
  let period_start, period_end;

  if (frequency === 'monthly') {
    period_start = new Date(now.getFullYear(), now.getMonth(), 1);
    period_end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (frequency === 'weekly') {
    const day = now.getDay();
    period_start = new Date(now);
    period_start.setDate(now.getDate() - day);
    period_end = new Date(period_start);
    period_end.setDate(period_start.getDate() + 6);
  } else if (frequency === 'yearly') {
    period_start = new Date(now.getFullYear(), 0, 1);
    period_end = new Date(now.getFullYear(), 11, 31);
  }

  return {
    period_start: period_start.toISOString().split('T')[0],
    period_end: period_end.toISOString().split('T')[0],
  };
}

async function getAllTemplates(user) {
  if (user.role == 1) {
    return budgetTemplateRepository.findAll();
  }
  return budgetTemplateRepository.findByUserId(user.sub);
}

async function getTemplateById(id, user) {
  const template = await budgetTemplateRepository.findById(id);
  assertFound(template, id, 'budget template');
  assertOwnership(template, user, 'budget template');
  return template;
}

async function createTemplate(data, user) {
  return budgetTemplateRepository.create({
    user_id: user.sub,
    category_id: data.category_id,
    amount: data.amount,
    frequency: data.frequency,
    is_recurring: data.is_recurring !== undefined ? data.is_recurring : true,
  });
}

async function updateTemplate(id, data, user) {
  const template = await budgetTemplateRepository.findById(id);
  assertFound(template, id, 'budget template');
  assertOwnership(template, user, 'budget template');

  const updated = await budgetTemplateRepository.update(id, {
    amount: data.amount,
    frequency: data.frequency,
    is_recurring:
      data.is_recurring !== undefined
        ? data.is_recurring
        : template.is_recurring,
  });
  assertFound(updated, id, 'budget template');
  return updated;
}

async function deleteTemplate(id, user) {
  const template = await budgetTemplateRepository.findById(id);
  assertFound(template, id, 'budget template');
  assertOwnership(template, user, 'budget template');

  const deleted = await budgetTemplateRepository.remove(id);
  if (!deleted) {
    throw httpError(`budget template with id ${id} not found`, 404);
  }
}

async function getActiveInstance(template_id, user) {
  const template = await budgetTemplateRepository.findById(template_id);
  assertFound(template, template_id, 'budget template');
  assertOwnership(template, user, 'budget template');

  const today = new Date().toISOString().split('T')[0];
  let instance = await budgetInstanceRepository.findActiveByTemplateId(
    template_id,
    today,
  );

  if (!instance) {
    const { period_start, period_end } = calculatePeriod(template.frequency);
    instance = await budgetInstanceRepository.create({
      template_id: template.id,
      period_start,
      period_end,
    });
  }

  return instance;
}

async function getInstanceSummary(instance_id, user) {
  const instance = await budgetInstanceRepository.findById(instance_id);
  assertFound(instance, instance_id, 'budget instance');

  const template = await budgetTemplateRepository.findById(
    instance.template_id,
  );
  assertFound(template, instance.template_id, 'budget template');
  assertOwnership(template, user, 'budget template');

  const spent = await transactionRepository.sumExpenseByCategoryAndPeriod(
    template.category_id,
    instance.period_start,
    instance.period_end,
  );

  const remaining = Math.max(0, Number(template.amount) - spent);
  const today = new Date();
  const endDate = new Date(instance.period_end);
  const days_left = Math.max(
    0,
    Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
  );
  const daily_estimate = days_left > 0 ? Math.round(remaining / days_left) : 0;

  return {
    id: instance.id,
    template_id: instance.template_id,
    category_id: template.category_id,
    period_start: instance.period_start,
    period_end: instance.period_end,
    budget: Number(template.amount),
    spent,
    remaining,
    days_left,
    daily_estimate,
  };
}

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getActiveInstance,
  getInstanceSummary,
};
