const { Scenes, Markup } = require('telegraf');
const telegramService = require('../services/telegramService');
const transactionService = require('../services/transactionService');
const logger = require('../utils/logger');

const MAX_AMOUNT = 99999999999999;
const MAX_DESCRIPTION = 500;

const rupiah = (value) => new Intl.NumberFormat('id-ID').format(Number(value));

const TYPE_LABELS = { expense: 'Pengeluaran', income: 'Pemasukan' };

async function cancelIfCommand(ctx) {
  const text = ctx.message && ctx.message.text;
  if (!text || !text.startsWith('/')) return false;
  if (text.startsWith('/batal')) {
    await ctx.reply('Transaksi dibatalkan.');
    await ctx.scene.leave();
  } else {
    await ctx.reply('Ketik /batal untuk membatalkan, atau lanjutkan wizard.');
  }
  return true;
}

const transactionWizard = new Scenes.WizardScene(
  'transaction-wizard',

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    await ctx.reply(
      'Pilih tipe transaksi:',
      Markup.inlineKeyboard([
        Markup.button.callback(TYPE_LABELS.expense, 'expense'),
        Markup.button.callback(TYPE_LABELS.income, 'income'),
      ]),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (!ctx.callbackQuery) {
      await ctx.reply('Gunakan tombol di bawah untuk memilih tipe.');
      return;
    }
    const type = ctx.callbackQuery.data;
    if (type !== 'expense' && type !== 'income') {
      await ctx.answerCbQuery('Pilihan tidak valid');
      return;
    }
    ctx.wizard.state.type = type;

    const wallets = await telegramService.getWallets(ctx.wizard.state.user.id);
    if (wallets.length === 0) {
      await ctx.answerCbQuery();
      await ctx.reply('Belum ada dompet. Buat dompet dulu di aplikasi.');
      return ctx.scene.leave();
    }
    await ctx.answerCbQuery();
    await ctx.reply(
      'Pilih dompet:',
      Markup.inlineKeyboard(
        wallets.map((wallet) => [
          Markup.button.callback(wallet.name.slice(0, 60), wallet.id),
        ]),
      ),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (!ctx.callbackQuery) {
      await ctx.reply('Gunakan tombol di bawah untuk memilih dompet.');
      return;
    }
    const walletId = ctx.callbackQuery.data;
    const wallets = await telegramService.getWallets(ctx.wizard.state.user.id);
    const wallet = wallets.find((item) => item.id === walletId);
    if (!wallet) {
      await ctx.answerCbQuery('Dompet tidak valid');
      return;
    }
    ctx.wizard.state.wallet_id = walletId;
    ctx.wizard.state.wallet_name = wallet.name;

    const categories = await telegramService.getCategories(
      ctx.wizard.state.user.id,
      ctx.wizard.state.type,
    );
    if (categories.length === 0) {
      await ctx.answerCbQuery();
      await ctx.reply('Belum ada kategori. Buat kategori dulu di aplikasi.');
      return ctx.scene.leave();
    }
    await ctx.answerCbQuery();
    await ctx.reply(
      'Pilih kategori:',
      Markup.inlineKeyboard(
        categories.map((category) => [
          Markup.button.callback(category.name.slice(0, 60), category.id),
        ]),
      ),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (!ctx.callbackQuery) {
      await ctx.reply('Gunakan tombol di bawah untuk memilih kategori.');
      return;
    }
    const categoryId = ctx.callbackQuery.data;
    const categories = await telegramService.getCategories(
      ctx.wizard.state.user.id,
      ctx.wizard.state.type,
    );
    const category = categories.find((item) => item.id === categoryId);
    if (!category) {
      await ctx.answerCbQuery('Kategori tidak valid');
      return;
    }
    ctx.wizard.state.category_id = categoryId;
    ctx.wizard.state.category_name = category.name;

    await ctx.answerCbQuery();
    await ctx.reply('Berapa nominalnya? (angka bulat, contoh: 50000)');
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Kirim nominal sebagai angka, contoh: 50000');
      return;
    }
    const amount = ctx.message.text.trim();
    if (
      !/^\d+$/.test(amount) ||
      Number(amount) < 1 ||
      Number(amount) > MAX_AMOUNT
    ) {
      await ctx.reply(
        `Nominal tidak valid. Gunakan angka bulat positif maksimal ${rupiah(MAX_AMOUNT)}.`,
      );
      return;
    }
    ctx.wizard.state.amount = Number(amount);
    await ctx.reply(
      'Catatan (opsional). Kirim teks atau tekan tombol Lewati.',
      Markup.inlineKeyboard([Markup.button.callback('Lewati', 'skip')]),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (ctx.callbackQuery && ctx.callbackQuery.data === 'skip') {
      ctx.wizard.state.description = null;
      await ctx.answerCbQuery();
    } else if (ctx.message && ctx.message.text) {
      const description = ctx.message.text.trim();
      if (description.length > MAX_DESCRIPTION) {
        await ctx.reply(
          `Catatan terlalu panjang (maks ${MAX_DESCRIPTION} karakter).`,
        );
        return;
      }
      ctx.wizard.state.description = description || null;
    } else {
      await ctx.reply('Kirim catatan atau tekan tombol Lewati.');
      return;
    }

    const state = ctx.wizard.state;
    await ctx.reply(
      [
        'Konfirmasi transaksi:',
        `Tipe: ${TYPE_LABELS[state.type]}`,
        `Dompet: ${state.wallet_name}`,
        `Kategori: ${state.category_name}`,
        `Nominal: Rp ${rupiah(state.amount)}`,
        state.description ? `Catatan: ${state.description}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      Markup.inlineKeyboard([
        Markup.button.callback('Simpan', 'confirm'),
        Markup.button.callback('Batal', 'cancel'),
      ]),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (!ctx.callbackQuery) {
      await ctx.reply('Gunakan tombol Simpan / Batal.');
      return;
    }
    const action = ctx.callbackQuery.data;
    if (action === 'cancel') {
      await ctx.answerCbQuery();
      await ctx.reply('Transaksi dibatalkan.');
      return ctx.scene.leave();
    }
    if (action !== 'confirm') {
      await ctx.answerCbQuery('Pilihan tidak valid');
      return;
    }

    const state = ctx.wizard.state;
    try {
      const transaction = await transactionService.createTransaction(
        {
          wallet_id: state.wallet_id,
          category_id: state.category_id,
          amount: state.amount,
          type: state.type,
          description: state.description,
        },
        { sub: state.user.id, role: state.user.role },
      );
      await ctx.answerCbQuery();
      await ctx.reply(
        `Transaksi tersimpan:\n${TYPE_LABELS[state.type]} Rp ${rupiah(transaction.amount)} (${state.category_name})`,
      );
    } catch (err) {
      logger.error(
        { err, userId: state.user.id },
        'telegram transaction failed',
      );
      const message =
        err.status === 402
          ? 'Saldo dompet tidak mencukupi.'
          : 'Gagal menyimpan transaksi. Coba lagi.';
      await ctx.answerCbQuery(message, true);
      await ctx.reply(message);
    }
    return ctx.scene.leave();
  },
);

module.exports = { transactionWizard };
