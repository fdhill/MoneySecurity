CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed admin pertama (role 1 = admin). Ganti password ini setelah setup awal.
INSERT INTO users (name, whatsapp_number, password, role)
VALUES ('Admin', '080000000000', crypt('admin123', gen_salt('bf')), 1);
