const MESSAGE_MAP = {
  'transaction created successfully': 'Transaksi berhasil ditambahkan',
  'transaction updated successfully': 'Transaksi berhasil diperbarui',
  'transaction deleted successfully': 'Transaksi berhasil dihapus',
  'category created successfully': 'Kategori berhasil ditambahkan',
  'category updated successfully': 'Kategori berhasil diperbarui',
  'category deleted successfully': 'Kategori berhasil dihapus',
  'wallet created successfully': 'Dompet berhasil ditambahkan',
  'wallet updated successfully': 'Dompet berhasil diperbarui',
  'wallet deleted successfully': 'Dompet berhasil dihapus',
  'transfer successful': 'Transfer berhasil',
  'budget template created successfully': 'Anggaran berhasil ditambahkan',
  'budget template updated successfully': 'Anggaran berhasil diperbarui',
  'budget template deleted successfully': 'Anggaran berhasil dihapus',
  'Login successful': 'Login berhasil',
  'category, wallet, amount, and type are required':
    'Kategori, dompet, jumlah, dan tipe wajib diisi',
  'name and type are required': 'Nama dan tipe wajib diisi',
  'name is required': 'Nama wajib diisi',
  'category_id, amount, and frequency are required':
    'Kategori, jumlah, dan frekuensi wajib diisi',
  'amount and frequency are required': 'Jumlah dan frekuensi wajib diisi',
  'number and password are required': 'Nomor dan password wajib diisi',
  'email is required': 'Email wajib diisi',
  'invalid email': 'Email tidak valid',
  'Invalid email or password': 'Email atau password salah',
  'Invalid password': 'Password salah',
  'Access token is missing': 'Token akses tidak ditemukan',
  'phone number already used': 'Nomor telepon sudah digunakan',
  'email already used': 'Email sudah digunakan',
  'OTP sent to email': 'Kode OTP sudah dikirim ke email',
  'OTP expired': 'Kode OTP sudah kadaluarsa',
  'OTP invalid': 'Kode OTP salah',
  'Too many OTP requests': 'Terlalu banyak request OTP, coba lagi dalam 1 menit',
  'Too many OTP attempts': 'Terlalu banyak percobaan, kode OTP kadaluarsa',
  'Registration successful': 'Registrasi berhasil',
  'phone number required for telegram bot': 'Nomor HP wajib diisi untuk menggunakan bot Telegram',
  'Route not found': 'Halaman tidak ditemukan',
};

const MESSAGE_PATTERNS = [
  {
    re: /transaction with id \d+ not found/i,
    text: 'Transaksi tidak ditemukan',
  },
  { re: /category with id \d+ not found/i, text: 'Kategori tidak ditemukan' },
  { re: /wallet with id \d+ not found/i, text: 'Dompet tidak ditemukan' },
  {
    re: /Template with id \d+ not found/i,
    text: 'Template anggaran tidak ditemukan',
  },
  {
    re: /you don't have enough money in your .+ wallet/i,
    text: 'Saldo dompet tidak mencukupi',
  },
  {
    re: /Category .+ is an (income|expense) category, but transaction type is set to .+/i,
    text: 'Tipe kategori tidak sesuai dengan tipe transaksi',
  },
  {
    re: /You do not have permission to access this resource/i,
    text: 'Anda tidak memiliki izin untuk mengakses sumber daya ini',
  },
  {
    re: /You do not have permission to access this (category|wallet|transaction)/i,
    text: 'Anda tidak memiliki izin untuk mengakses sumber daya ini',
  },
  {
    re: /You do not have permission to access this category or wallet/i,
    text: 'Anda tidak memiliki izin untuk mengakses kategori atau dompet ini',
  },
  {
    re: /You can only transfer between your own wallets/i,
    text: 'Transfer hanya boleh antar dompet milik Anda sendiri',
  },
  {
    re: /Source and destination wallets must be different/i,
    text: 'Dompet asal dan tujuan tidak boleh sama',
  },
];

export function translateApiMessage(message) {
  if (!message) return 'Terjadi kesalahan';
  if (MESSAGE_MAP[message]) return MESSAGE_MAP[message];
  for (const { re, text } of MESSAGE_PATTERNS) {
    if (re.test(message)) return text;
  }
  return message;
}
