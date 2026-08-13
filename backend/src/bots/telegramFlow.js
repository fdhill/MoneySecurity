const { Scenes, Markup } = require('telegraf');
const telegramService = require('../services/telegramService');
const transactionService = require('../services/transactionService');
const exportService = require('../services/exportService');
const logger = require('../utils/logger');

const MAX_AMOUNT = 99999999999999;
const MAX_DESCRIPTION = 500;

const rupiah = (value) => new Intl.NumberFormat('id-ID').format(Number(value));

const TYPE_LABELS = { expense: 'Pengeluaran', income: 'Pemasukan' };
const TYPE_BY_LABEL = { pengeluaran: 'expense', pemasukan: 'income' };
const FULL_TEXT_RE = /^(pengeluaran|pemasukan)_/i;

async function cancelIfCommand(ctx) {
  const text = ctx.message && ctx.message.text;
  if (!text || !text.startsWith('/')) return false;
  if (text.startsWith('/batal')) {
    await ctx.reply('Transaksi dibatalkan.');
    await ctx.scene.leave();
  }
  return true;
}

const transactionWizard = new Scenes.WizardScene(
  'transaction-wizard',

  async (ctx) => {
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

    const categories = await telegramService.getCategories(
      ctx.wizard.state.user.id,
      type,
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

    await ctx.reply(
      'Siap disimpan?',
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

const exportWizard = new Scenes.WizardScene(
  'export-wizard',

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    await ctx.reply(
      'Export transaksi ke Excel.\n\nTanggal mulai (YYYY-MM-DD) atau tekan tombol Semua untuk export semua data:',
      Markup.inlineKeyboard([Markup.button.callback('Semua', 'skip')]),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (ctx.callbackQuery && ctx.callbackQuery.data === 'skip') {
      ctx.wizard.state.start_date = null;
      await ctx.answerCbQuery();
    } else if (ctx.message && ctx.message.text) {
      const value = ctx.message.text.trim();
      if (!isValidDate(value)) {
        await ctx.reply('Format tanggal tidak valid. Gunakan YYYY-MM-DD atau tekan Semua.');
        return;
      }
      ctx.wizard.state.start_date = value;
    } else {
      await ctx.reply('Kirim tanggal mulai (YYYY-MM-DD) atau tekan tombol Semua.');
      return;
    }

    await ctx.reply(
      'Tanggal selesai (YYYY-MM-DD) atau tekan tombol Semua:',
      Markup.inlineKeyboard([Markup.button.callback('Semua', 'skip')]),
    );
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (await cancelIfCommand(ctx)) return;
    if (ctx.callbackQuery && ctx.callbackQuery.data === 'skip') {
      ctx.wizard.state.end_date = null;
      await ctx.answerCbQuery();
    } else if (ctx.message && ctx.message.text) {
      const value = ctx.message.text.trim();
      if (!isValidDate(value)) {
        await ctx.reply('Format tanggal tidak valid. Gunakan YYYY-MM-DD atau tekan Semua.');
        return;
      }
      ctx.wizard.state.end_date = value;
    } else {
      await ctx.reply('Kirim tanggal selesai (YYYY-MM-DD) atau tekan tombol Semua.');
      return;
    }

    const state = ctx.wizard.state;
    const sent = await ctx.reply('Mengexport transaksi...');
    try {
      const workbook = await exportService.exportTransactions(
        { sub: state.user.id, role: state.user.role },
        { start_date: state.start_date, end_date: state.end_date },
      );
      const buffer = await workbook.xlsx.writeBuffer();
      const today = new Date().toISOString().slice(0, 10);
      await ctx.replyWithDocument({ source: buffer, filename: `transactions_${today}.xlsx` });
      await ctx.telegram.deleteMessage(ctx.chat.id, sent.message_id).catch(() => {});
    } catch (err) {
      logger.error({ err, userId: state.user.id }, 'telegram export failed');
      await ctx.reply('Gagal mengexport transaksi. Coba lagi.');
    }
    return ctx.scene.leave();
  },
);

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function parseFullText(text) {
  if (!FULL_TEXT_RE.test(text)) return { error: 'not-a-transaction' };

  const parts = text.trim().split('_');
  const type = TYPE_BY_LABEL[parts[0].toLowerCase()];
  const categoryName = parts[1];
  const walletName = parts[2];
  const amountRaw = parts[3];
  const description = parts.slice(4).join('_').trim() || null;

  if (!categoryName || !walletName || !amountRaw) {
    return { error: 'format' };
  }
  if (
    !/^\d+$/.test(amountRaw) ||
    Number(amountRaw) < 1 ||
    Number(amountRaw) > MAX_AMOUNT
  ) {
    return { error: 'amount' };
  }
  return {
    value: {
      type,
      categoryName,
      walletName,
      amount: Number(amountRaw),
      description,
    },
  };
}

async function handleFullTextTransaction(ctx, user, text) {
  const { error, value } = parseFullText(text);
  if (error === 'not-a-transaction') return;
  if (error) {
    await ctx.reply(
      error === 'amount'
        ? `Nominal tidak valid. Gunakan angka bulat positif maksimal ${rupiah(MAX_AMOUNT)}.`
        : 'Format salah. Gunakan: <tipe>_<kategori>_<dompet>_<nominal>_<catatan>\n' +
          'Contoh: pengeluaran_makan_cash_50000',
    );
    return;
  }

  const { type, categoryName, walletName, amount, description } = value;

  const categories = await telegramService.getCategories(user.id, type);
  const category = categories.find(
    (item) => item.name.toLowerCase() === categoryName.toLowerCase(),
  );
  if (!category) {
    await ctx.reply(`Kategori "${categoryName}" tidak ditemukan untuk tipe ${type}.`);
    return;
  }

  const wallets = await telegramService.getWallets(user.id);
  const wallet = wallets.find(
    (item) => item.name.toLowerCase() === walletName.toLowerCase(),
  );
  if (!wallet) {
    await ctx.reply(`Dompet "${walletName}" tidak ditemukan.`);
    return;
  }

  if (description && description.length > MAX_DESCRIPTION) {
    await ctx.reply(
      `Catatan terlalu panjang (maks ${MAX_DESCRIPTION} karakter).`,
    );
    return;
  }

  try {
    const transaction = await transactionService.createTransaction(
      {
        wallet_id: wallet.id,
        category_id: category.id,
        amount,
        type,
        description,
      },
      { sub: user.id, role: user.role },
    );
    await ctx.reply(
      `Transaksi tersimpan:\n${TYPE_LABELS[type]} Rp ${rupiah(transaction.amount)} (${category.name})`,
    );
  } catch (err) {
    logger.error({ err, userId: user.id }, 'telegram full-text transaction failed');
    const message =
      err.status === 402
        ? 'Saldo dompet tidak mencukupi.'
        : 'Gagal menyimpan transaksi. Coba lagi.';
    await ctx.reply(message);
  }
}

module.exports = {
  transactionWizard,
  exportWizard,
  handleFullTextTransaction,
  parseFullText,
  FULL_TEXT_RE,
};
