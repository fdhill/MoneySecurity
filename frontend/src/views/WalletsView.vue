<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Edit2, Trash2, Banknote } from '@lucide/vue';
import WalletModal from '@/components/wallets/WalletModal.vue';
import { formatIDR, formatShort } from '@/components/common/icons';
import api from '@/services/api';

const wallets = ref([]);
const transactions = ref([]);
const loading = ref(true);
const showWalletModal = ref(false);
const editingWallet = ref(null);

const WALLET_COLORS = ['#10b981', '#2563eb', '#00aed6', '#ee4d2d', '#8b5cf6', '#f59e0b', '#ec4899', '#0f172a', '#6366f1', '#f97316'];

const totalBalance = computed(() => wallets.value.reduce((s, w) => s + Number(w.balance), 0));

const walletStats = computed(() => {
  const stats = {};
  wallets.value.forEach(w => { stats[w.id] = { count: 0, income: 0, expense: 0 }; });
  transactions.value.forEach(t => {
    if (stats[t.wallet_id]) {
      stats[t.wallet_id].count++;
      if (t.type === 'income') stats[t.wallet_id].income += Number(t.amount);
      else stats[t.wallet_id].expense += Number(t.amount);
    }
  });
  return stats;
});

const recentWalletTx = computed(() => {
  return [...transactions.value]
    .sort((a, b) => (b.transaction_date || '').localeCompare(a.transaction_date || ''))
    .slice(0, 8);
});

function getWalletColor(index) {
  return WALLET_COLORS[index % WALLET_COLORS.length];
}

async function fetchData() {
  loading.value = true;
  try {
    const [walRes, txRes] = await Promise.all([api.get('/wallets'), api.get('/transactions')]);
    wallets.value = walRes.data || [];
    transactions.value = txRes.data || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);

function openAdd() {
  editingWallet.value = null;
  showWalletModal.value = true;
}

function openEdit(w) {
  editingWallet.value = { ...w };
  showWalletModal.value = true;
}

function saveWallet(data) {
  const p = editingWallet.value
    ? api.put(`/wallets/${editingWallet.value.id}`, data)
    : api.post('/wallets', data);
  p.then(() => {
    showWalletModal.value = false;
    editingWallet.value = null;
    fetchData();
  });
}

function deleteWallet(id) {
  if (confirm('Hapus dompet ini? Semua transaksi terkait akan terpengaruh.')) {
    api.delete(`/wallets/${id}`).then(fetchData);
  }
}

function getWalletName(id) {
  return wallets.value.find(w => w.id === id)?.name || '-';
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-foreground">Dompet</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Total saldo &middot; <span class="font-mono font-semibold text-foreground">{{ formatIDR(totalBalance) }}</span></p>
      </div>
      <button @click="openAdd" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
        <Plus :size="16" /> Tambah Dompet
      </button>
    </div>

    <template v-if="!loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="(w, wi) in wallets" :key="w.id"
          class="group bg-card rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center"
                :style="{ backgroundColor: w.color || getWalletColor(wi) + '22', color: w.color || getWalletColor(wi) }">
                <Banknote :size="20" />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">{{ w.name }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ walletStats[w.id]?.count || 0 }} transaksi</p>
              </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openEdit(w)" class="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-muted-foreground transition-colors">
                <Edit2 :size="14" />
              </button>
              <button @click="deleteWallet(w.id)" class="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 text-muted-foreground transition-colors">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <p class="text-xl font-bold text-foreground font-mono mb-3">{{ formatIDR(Number(w.balance)) }}</p>

          <div class="flex items-center gap-4 pt-3 border-t border-border">
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span class="text-xs text-muted-foreground">Masuk</span>
              <span class="text-xs font-semibold font-mono text-emerald-600">{{ formatIDR(walletStats[w.id]?.income || 0) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
              <span class="text-xs text-muted-foreground">Keluar</span>
              <span class="text-xs font-semibold font-mono text-rose-500">{{ formatIDR(walletStats[w.id]?.expense || 0) }}</span>
            </div>
          </div>
        </div>

        <button @click="openAdd"
          class="border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-muted/30 transition-all min-h-[160px]">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center bg-muted text-muted-foreground">
            <Plus :size="20" />
          </div>
          <span class="text-sm font-medium text-muted-foreground">Tambah Dompet Baru</span>
        </button>
      </div>

      <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="text-sm font-semibold text-foreground">Transaksi Terakhir</h3>
          <span class="text-xs text-muted-foreground">Semua dompet</span>
        </div>
        <div class="divide-y divide-border">
          <div v-if="recentWalletTx.length === 0" class="text-center py-12 text-muted-foreground text-sm">
            Belum ada transaksi
          </div>
          <div v-for="tx in recentWalletTx" :key="tx.id" class="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: (wallets.find(w => w.id === tx.wallet_id)?.color || '#6b7a99') + '22', color: wallets.find(w => w.id === tx.wallet_id)?.color || '#6b7a99' }">
              <Banknote :size="14" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ tx.description }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-muted-foreground">{{ getWalletName(tx.wallet_id) }}</span>
                <span class="text-xs text-muted-foreground">&middot;</span>
                <span class="text-xs text-muted-foreground">{{ tx.transaction_date }}</span>
              </div>
            </div>
            <span class="text-sm font-bold font-mono whitespace-nowrap" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'">
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatIDR(Number(tx.amount)) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-center py-20 text-muted-foreground">Memuat data...</div>
    </template>

    <WalletModal v-if="showWalletModal" :editing="editingWallet" @save="saveWallet" @close="showWalletModal = false; editingWallet = null" />
  </div>
</template>
