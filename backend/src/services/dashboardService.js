const walletRepository = require('../repositories/walletRepository');
const categoryRepository = require('../repositories/categoryRepository');
const transactionRepository = require('../repositories/transactionRepository');
const budgetTemplateRepository = require('../repositories/budgetTemplateRepository');
const budgetService = require('./budgetService');

function periodForMonth(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
  };
}

function periodForMonthToDate() {
  const now = new Date();
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const days = [];
  for (let i = 1; i <= now.getDate(); i++) {
    days.push(fmt(new Date(now.getFullYear(), now.getMonth(), i)));
  }
  return { start: days[0], end: days[days.length - 1], days };
}

async function buildBudgetSummaries(templates, user) {
  const summaries = [];
  for (const template of templates) {
    try {
      const instance = await budgetService.getActiveInstance(template.id, user);
      if (instance && instance.id) {
        summaries.push(
          await budgetService.getInstanceSummary(instance.id, user),
        );
      }
    } catch (e) {
      // lewati template yang tidak bisa dihitung ringkasannya
    }
  }
  return summaries;
}

async function getDashboard(user) {
  const current = periodForMonth();
  const monthToDate = periodForMonthToDate();

  const [wallets, categories, totals, dayRows, categoryRows, recentPage, budgets] =
    await Promise.all([
      walletRepository.findByUserId(user.sub),
      categoryRepository.findByUserId(user.sub),
      transactionRepository.sumIncomeExpenseByPeriod(
        user.sub,
        current.start,
        current.end,
      ),
      transactionRepository.sumByDay(user.sub, monthToDate.start, monthToDate.end),
      transactionRepository.sumExpenseByCategory(user.sub, 5),
      transactionRepository.findByUserId(user.sub, { page: 1, limit: 5 }),
      budgetTemplateRepository.findByUserId(user.sub),
    ]);

  const monthly = monthToDate.days.map((day) => {
    const row = dayRows.find((r) => r.day === day);
    return {
      day,
      income: row ? Number(row.income) : 0,
      expense: row ? Number(row.expense) : 0,
    };
  });

  const budgetSummaries = await buildBudgetSummaries(budgets, user);

  return {
    wallets,
    categories,
    totals: {
      income: Number(totals.income || 0),
      expense: Number(totals.expense || 0),
    },
    monthly,
    categoryExpense: categoryRows.map((r) => ({
      category_id: r.category_id,
      name: r.name,
      total: Number(r.total),
    })),
    recentTransactions: recentPage.rows.map((t) => ({
      ...t.toJSON(),
      category_id: t.category_id,
      wallet_id: t.wallet_id,
    })),
    budgets,
    budgetSummaries,
  };
}

module.exports = { getDashboard };
