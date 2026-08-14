<script setup>
import { ref, watch, onMounted } from 'vue';
import { Plus, Download, Search, Edit2, Trash2, Briefcase, ChevronLeft, ChevronRight } from '@lucide/vue';
import TxModal from '@/components/transactions/TxModal.vue';
import ExportModal from '@/components/transactions/ExportModal.vue';
import CategoryBadge from '@/components/common/CategoryBadge.vue';
import { formatIDR, formatShort } from '@/components/common/icons';
import { transactionService } from '@/services/transactionService';
import { categoryService } from '@/services/categoryService';
import { walletService } from '@/services/walletService';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const transactions = ref([]);
const categories = ref([]);
const wallets = ref([]);
const loading = ref(true);
const search = ref('');
const filterCat = ref('all');
const filterWallet = ref('all');
const filterType = ref('all');
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const totalPages = ref(1);
const showTxModal = ref(false);
const editingTx = ref(null);
const showExportModal = ref(false);
const exporting = ref(false);

async function fetchData() {
  loading.value = true;
  try {
    const [txRes, catRes, walRes] = await Promise.all([
      transactionService.list({
        page: page.value,
        limit: limit.value,
        q: search.value || undefined,
        category_id: filterCat.value !== 'all' ? filterCat.value : undefined,
        wallet_id: filterWallet.value !== 'all' ? filterWallet.value : undefined,
        type: filterType.value !== 'all' ? filterType.value : undefined,
      }),
      categoryService.list(),
      walletService.list(),
    ]);
    transactions.value = (txRes.data?.data || []).map(t => ({ ...t, category_id: t.category?.id, wallet_id: t.wallet?.id }));
    total.value = txRes.data?.pagination?.total || 0;
    totalPages.value = Math.max(1, txRes.data?.pagination?.totalPages || 1);
    if (page.value > totalPages.value) {
      page.value = totalPages.value;
      await fetchData();
      return;
    }
    categories.value = (catRes.data || []).map((c, i) => ({ ...c, _color: ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899','#0ea5e9','#ef4444','#f97316','#92400e','#6366f1'][i % 10], _iconName: ['utensils','car','briefcase','music','shopping','graduation','heart','zap','coffee','home'][i % 10] }));
    wallets.value = walRes.data || [];
  } catch (e) { console.error(e); } finally { loading.value = false; }
}
onMounted(fetchData);

let searchTimer;
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { page.value = 1; fetchData(); }, 300);
});
watch([filterCat, filterWallet, filterType], () => { page.value = 1; fetchData(); });

function changePage(delta) {
  const next = page.value + delta;
  if (next >= 1 && next <= totalPages.value) {
    page.value = next;
    fetchData();
  }
}

function openAdd() { editingTx.value = null; showTxModal.value = true; }
function openEdit(tx) { editingTx.value = tx; showTxModal.value = true; }
function saveTx(data) {
  const p = editingTx.value ? transactionService.update(editingTx.value.id, data) : transactionService.create(data);
  p.then((res) => {
    showToast(res?.message, 'success');
    showTxModal.value = false;
    editingTx.value = null;
    fetchData();
  }).catch((e) => showToast(e?.message, 'error'));
}
function deleteTx(id) {
  if (confirm('Hapus transaksi ini?')) {
    transactionService.remove(id).then((res) => {
      showToast(res?.message, 'success');
      fetchData();
    }).catch((e) => showToast(e?.message, 'error'));
  }
}

function getCatById(id) { return categories.value.find(c => c.id === id); }
function getWalById(id) { return wallets.value.find(w => w.id === id); }
function formatDate(d) { return (d || '').slice(0, 10); }

function exportData(params) {
  exporting.value = true;
  transactionService.exportTransactions(params)
    .then(() => {
      showToast('Export berhasil diunduh', 'success');
      showExportModal.value = false;
    })
    .catch((e) => showToast(e?.message || 'Export gagal', 'error'))
    .finally(() => { exporting.value = false; });
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-foreground">Transaksi</h1>
        <p class="text-sm text-muted-foreground mt-0.5">{{ total }} transaksi ditemukan</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="showExportModal = true" :disabled="exporting" class="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-60">
          <Download :size="15" /> {{ exporting ? 'Mengexport...' : 'Export' }}
        </button>
        <button @click="openAdd" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
          <Plus :size="16" /> Tambah
        </button>
      </div>
    </div>

    <div class="bg-card rounded-2xl border border-border p-4 shadow-sm">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[180px]">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input v-model="search" placeholder="Cari deskripsi..."
            class="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-muted text-sm border border-transparent focus:border-ring focus:outline-none" />
        </div>
        <select v-model="filterCat" class="px-3 py-2.5 rounded-xl bg-muted text-sm border border-transparent focus:border-ring focus:outline-none text-foreground">
          <option value="all">Semua Kategori</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="filterWallet" class="px-3 py-2.5 rounded-xl bg-muted text-sm border border-transparent focus:border-ring focus:outline-none text-foreground">
          <option value="all">Semua Dompet</option>
          <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
        <div class="flex rounded-xl overflow-hidden border border-border bg-muted">
          <button v-for="([v, l]) in [['all','Semua'],['income','Masuk'],['expense','Keluar']]" :key="v" @click="filterType = v"
            class="px-3 py-2 text-xs font-semibold transition-colors"
            :class="filterType === v ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'">{{ l }}</button>
        </div>
      </div>
    </div>

    <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full">
          <thead><tr class="border-b border-border bg-muted/40">
            <th class="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">Tanggal</th>
            <th class="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Kategori</th>
            <th class="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Deskripsi</th>
            <th class="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Dompet</th>
            <th class="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Nominal</th>
            <th class="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Aksi</th>
          </tr></thead>
          <tbody class="divide-y divide-border">
            <tr v-if="transactions.length === 0"><td colspan="6" class="text-center py-16 text-muted-foreground text-sm">Tidak ada transaksi</td></tr>
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-muted/20 transition-colors group">
              <td class="px-5 py-3.5 text-sm text-muted-foreground font-mono whitespace-nowrap">{{ formatDate(tx.transaction_date) }}</td>
              <td class="px-4 py-3.5"><CategoryBadge :category="getCatById(tx.category_id)" /></td>
              <td class="px-4 py-3.5 text-sm text-foreground max-w-[200px] truncate">{{ tx.description }}</td>
              <td class="px-4 py-3.5 text-xs text-muted-foreground">{{ getWalById(tx.wallet_id)?.name }}</td>
              <td class="px-4 py-3.5 text-right text-sm font-bold font-mono whitespace-nowrap" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatIDR(Number(tx.amount)) }}
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEdit(tx)" class="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit2 :size="14" /></button>
                  <button @click="deleteTx(tx.id)" class="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="md:hidden divide-y divide-border">
        <div v-if="transactions.length === 0" class="text-center py-16 text-muted-foreground text-sm">Tidak ada transaksi</div>
        <div v-for="tx in transactions" :key="tx.id" class="flex items-center gap-3 px-4 py-3.5">
          <div class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
            :style="{ backgroundColor: (getCatById(tx.category_id)?._color || '#6b7a99') + '18', color: getCatById(tx.category_id)?._color || '#6b7a99' }">
            <Briefcase :size="14" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ tx.description }}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <CategoryBadge :category="getCatById(tx.category_id)" />
              <span class="text-xs text-muted-foreground">{{ formatDate(tx.transaction_date) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold font-mono" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'">
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatShort(Number(tx.amount)) }}
            </span>
            <button @click="deleteTx(tx.id)" class="p-1 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 :size="14" /></button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between px-5 py-3 border-t border-border">
        <span class="text-sm text-muted-foreground">Halaman {{ page }} dari {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button @click="changePage(-1)" :disabled="page <= 1"
            class="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft :size="14" /> Sebelumnya
          </button>
          <button @click="changePage(1)" :disabled="page >= totalPages"
            class="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Berikutnya <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </div>

    <TxModal v-if="showTxModal" :categories="categories" :wallets="wallets" :editing="editingTx" @save="saveTx" @close="showTxModal = false; editingTx = null" />
    <ExportModal v-if="showExportModal" @confirm="exportData" @close="showExportModal = false" />
  </div>
</template>
