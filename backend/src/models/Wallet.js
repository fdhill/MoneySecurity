class Wallet {
  constructor({ id, user_id, name, balance, created_at } = {}) {
    this.id = id ?? null;
    this.user_id = user_id ?? null;
    this.name = name ?? null;
    this.balance = balance ?? null;
    this.created_at = created_at ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      balance: this.balance,
      created_at: this.created_at,
    };
  }
}

module.exports = Wallet;
