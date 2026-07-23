class Transaction {
  static TYPE = Object.freeze({
    EXPENSE: 'expense',
    INCOME: 'income',
  });

  constructor({
    id,
    user_id,
    wallet_id,
    category_id,
    amount,
    type,
    description,
    transaction_date,
    created_at,
  } = {}) {
    this.id = id ?? null;
    this.user_id = user_id ?? null;
    this.wallet_id = wallet_id ?? null;
    this.category_id = category_id ?? null;
    this.amount = amount ?? null;
    this.type = type ?? null;
    this.description = description ?? null;
    this.transaction_date = transaction_date ?? null;
    this.created_at = created_at ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      wallet_id: this.wallet_id,
      category_id: this.category_id,
      amount: this.amount,
      type: this.type,
      description: this.description,
      transaction_date: this.transaction_date,
      created_at: this.created_at,
    };
  }
}

module.exports = Transaction;
