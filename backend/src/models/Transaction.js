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
    wallet_name,
    category_name,
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
    this.wallet_name = wallet_name ?? null;
    this.category_name = category_name ?? null;
    this.created_at = created_at ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      wallet_id: this.wallet_id,
      wallet_name: this.wallet_name,
      category_id: this.category_id,
      category_name: this.category_name,
      amount: this.amount,
      type: this.type,
      description: this.description,
      transaction_date: this.transaction_date,
    };
  }
}

module.exports = Transaction;
