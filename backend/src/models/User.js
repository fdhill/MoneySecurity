class User {
    constructor({id, name, whatsapp_number, created_at} = {}) {
        this.id = id ?? null;
        this.name = name ?? null;
        this.whatsapp_number = whatsapp_number ?? null;
        this.created_at = created_at ?? null;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            whatsapp_number: this.whatsapp_number,
            created_at: this.created_at
        };
    }
}

module.exports = User;