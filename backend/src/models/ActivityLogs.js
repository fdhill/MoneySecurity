class User {
  constructor({ id, user_id, description, read_at, created_at } = {}) {
    this.id = id ?? null;
    this.user_id = user_id ?? null;
    this.description = description ?? null;
    this.read_at = read_at ?? null;
    this.created_at = created_at ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      description: this.description,
      read_at: this.read_at,
    };
  }
}

module.exports = User;
