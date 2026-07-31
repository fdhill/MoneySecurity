<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Edit2, Trash2, Banknote } from '@lucide/vue';
import WalletModal from '@/components/wallets/WalletModal.vue';
import { formatIDR } from '@/components/common/icons';
import api from '@/services/api';

const wallets = ref([]);
const loading = ref(true);
const showWalletModal = ref(false);
const editingWallet = ref(null);

const WALLET_COLORS = ['#10b981', '#2563eb', '#00aed6', '#ee4d2d', '#8b5cf6', '#f59e0b', '#ec4899', '#0f172a', '#6366f1', '#f97316'];

const totalBalance = computed(() => wallets.value.reduce((s, w) => s + Number(w.balance), 0));

function getWalletColor(index) {
  return WALLET_COLORS[index % WALLET_COLORS.length];
}

async function fetchData() {
  loading.value = true;
  try {
    const walRes = await api.get('/wallets');
    wallets.value = walRes.data || [];
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
          class="group bg-card rounded-2xl border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center"
                :style="{ backgroundColor: getWalletColor(wi) + '22', color: getWalletColor(wi) }">
                <Banknote :size="20" />
              </div>
              <p class="text-sm font-semibold text-foreground">{{ w.name }}</p>
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
          <p class="text-xl font-bold text-foreground font-mono">{{ formatIDR(Number(w.balance)) }}</p>
        </div>

        <button @click="openAdd"
          class="border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-muted/30 transition-all min-h-[160px]">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center bg-muted text-muted-foreground">
            <Plus :size="20" />
          </div>
          <span class="text-sm font-medium text-muted-foreground">Tambah Dompet Baru</span>
        </button>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-center py-20 text-muted-foreground">Memuat data...</div>
    </template>

    <WalletModal v-if="showWalletModal" :editing="editingWallet" @save="saveWallet" @close="showWalletModal = false; editingWallet = null" />
  </div>
</template>
