class Category {
    constructor({id, user_id, name, type, created_at} = {}) {
        this.id = id ?? null;
        this.user_id = user_id ?? null;
        this.name = name ?? null;
        this.type = type ?? null;
        this.created_at = created_at ?? null;
    }

    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            name: this.name,
            type: this.type,
            created_at: this.created_at
        };
    }
}

module.exports = Category;