class BudgetInstance {
  constructor({ id, template_id, period_start, period_end, spent, created_at } = {}) {
    this.id = id ?? null;
    this.template_id = template_id ?? null;
    this.period_start = period_start ?? null;
    this.period_end = period_end ?? null;
    this.spent = spent ?? null;
    this.created_at = created_at ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      template_id: this.template_id,
      period_start: this.period_start,
      period_end: this.period_end,
      spent: this.spent,
    };
  }
}

module.exports = BudgetInstance;
