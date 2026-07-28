class BudgetTemplate {
  constructor({ id, user_id, category_id, amount, frequency, is_recurring, created_at } = {}) {
    this.id = id ?? null;
    this.user_id = user_id ?? null;
    this.category_id = category_id ?? null;
    this.amount = amount ?? null;
    this.frequency = frequency ?? null;
    this.is_recurring = is_recurring ?? null;
    this.created_at = created_at ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      category_id: this.category_id,
      amount: this.amount,
      frequency: this.frequency,
      is_recurring: this.is_recurring,
    };
  }
}

module.exports = BudgetTemplate;
