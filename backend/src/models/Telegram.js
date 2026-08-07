class Telegram {
  constructor({
    user_id,
    chat_id,
    link_token,
    link_token_expires_at,
    created_at,
  } = {}) {
    this.user_id = user_id ?? null;
    this.chat_id = chat_id ?? null;
    this.link_token = link_token ?? null;
    this.link_token_expires_at = link_token_expires_at ?? null;
    this.created_at = created_at ?? null;
  }

  isLinked() {
    return this.chat_id !== null;
  }
}

module.exports = Telegram;
