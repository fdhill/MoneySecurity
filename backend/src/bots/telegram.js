const { Telegraf, Scenes, session } = require('telegraf');
const logger = require('../utils/logger');
const telegramService = require('../services/telegramService');
const {
  transactionWizard,
  exportWizard,
  handleFullTextTransaction,
  FULL_TEXT_RE,
} = require('./telegramFlow');

const HELP_TEXT = [
  'Bot MoneySecurity',
  '',
  '/start - Mulai',
  '/link <KODE> - Hubungkan akun (kode dari aplikasi)',
  '/status - Cek status koneksi',
  '/transaksi - Catat transaksi baru',
  'Atau kirim langsung: pengeluaran_makan_cash_50000 (tipe_kategori_dompet_nominal)',
  'Contoh lain: pemasukan_gaji_bank_1500000_bonus',
  '/export - Export transaksi ke Excel',
  '/unlink - Putus koneksi akun',
  '/batal - Batalkan proses',
].join('\n');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session());
bot.use(new Scenes.Stage([transactionWizard, exportWizard]).middleware());

bot.start((ctx) =>
  ctx.reply(
    [
      `Halo ${ctx.from.first_name || 'sahabat'}!`,
      'Hubungkan dulu akun MoneySecurity-mu:',
      '1. Buka aplikasi MoneySecurity',
      '2. Masuk ke menu Telegram, salin kode link',
      '3. Kirim /link <KODE> ke bot ini',
    ].join('\n'),
  ),
);

bot.help((ctx) => ctx.reply(HELP_TEXT));

bot.command('link', async (ctx) => {
  const token = ctx.message.text.trim().split(/\s+/)[1];
  if (!token) {
    return ctx.reply(
      'Format: /link <KODE>\nKode didapat dari aplikasi MoneySecurity.',
    );
  }
  try {
    await telegramService.linkByToken(token, ctx.chat.id);
    await ctx.reply(
      'Akun berhasil terhubung! Kirim /transaksi untuk mencatat pengeluaran atau pemasukan.',
    );
  } catch (err) {
    logger.warn({ err, chatId: ctx.chat.id }, 'telegram link failed');
    await ctx.reply(
      err.status === 400 ? err.message : 'Gagal menghubungkan. Coba lagi.',
    );
  }
});

bot.command('status', async (ctx) => {
  const user = await telegramService.getUserByChatId(ctx.chat.id);
  await ctx.reply(
    user ? 'Akun terhubung.' : 'Akun belum terhubung. Kirim /link <KODE>.',
  );
});

bot.command('unlink', async (ctx) => {
  const user = await telegramService.getUserByChatId(ctx.chat.id);
  if (!user) {
    return ctx.reply('Akun belum terhubung.');
  }
  await telegramService.unlink(user.id);
  await ctx.reply('Akun berhasil diputus.');
});

bot.command('transaksi', async (ctx) => {
  const user = await telegramService.getUserByChatId(ctx.chat.id);
  if (!user) {
    return ctx.reply('Akun belum terhubung. Kirim /link <KODE> dulu.');
  }
  await ctx.scene.enter('transaction-wizard', {
    user: { id: user.id, role: user.role, name: user.name },
  });
});

bot.command('export', async (ctx) => {
  const user = await telegramService.getUserByChatId(ctx.chat.id);
  if (!user) {
    return ctx.reply('Akun belum terhubung. Kirim /link <KODE> dulu.');
  }
  await ctx.scene.enter('export-wizard', {
    user: { id: user.id, role: user.role, name: user.name },
  });
});

bot.command('batal', async (ctx) => {
  if (ctx.scene.current) await ctx.scene.leave();
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  if (!text || text.startsWith('/')) return;

  if (FULL_TEXT_RE.test(text)) {
    const user = await telegramService.getUserByChatId(ctx.chat.id);
    if (!user) {
      return ctx.reply('Akun belum terhubung. Kirim /link <KODE> dulu.');
    }
    return handleFullTextTransaction(ctx, user, text);
  }

  await ctx.reply(
    [
      `Halo ${ctx.from.first_name || 'sahabat'}! Saya bot MoneySecurity.`,
      '',
      'Berikut perintah yang bisa kamu gunakan:',
      '',
      HELP_TEXT.split('\n').slice(2).join('\n'),
    ].join('\n'),
  );
});

bot.catch((err, ctx) => {
  logger.error({ err, from: ctx.from }, 'telegram bot error');
});

bot.launch();
logger.info('telegram bot started');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
