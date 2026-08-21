class User {
  constructor({ id, name, email, phone_number, password, role, created_at } = {}) {
    this.id = id ?? null;
    this.name = name ?? null;
    this.email = email ?? null;
    this.phone_number = phone_number ?? null;
    this.password = password ?? null;
    this.role = role ?? null;
    this.created_at = created_at ?? null;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone_number: this.phone_number,
      role: this.role,
    };
  }
}

module.exports = User;
