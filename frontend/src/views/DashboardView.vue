<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Banknote, Utensils, Car, Briefcase, Music, ShoppingBag, GraduationCap, Heart, Home, Zap, Coffee } from '@lucide/vue';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip as ChartTooltip, Legend as ChartLegend } from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';
import StatCard from '@/components/dashboard/StatCard.vue';
import BudgetWidget from '@/components/dashboard/BudgetWidget.vue';
import TxModal from '@/components/transactions/TxModal.vue';
import { formatShort, formatIDR } from '@/components/common/icons';
import api from '@/services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, ChartTooltip, ChartLegend);

const router = useRouter();
const transactions = ref([]);
const categories = ref([]);
const wallets = ref([]);
const budgets = ref([]);
const loading = ref(true);
const showTxModal = ref(false);

const ICON_COMPONENTS = { utensils: Utensils, car: Car, briefcase: Briefcase, music: Music, shopping: ShoppingBag, graduation: GraduationCap, heart: Heart, home: Home, zap: Zap, coffee: Coffee };
const CATEGORY_DEFAULTS = { 'Makanan': { icon: 'utensils', color: '#f59e0b' }, 'Transportasi': { icon: 'car', color: '#3b82f6' }, 'Gaji': { icon: 'briefcase', color: '#10b981' }, 'Hiburan': { icon: 'music', color: '#8b5cf6' }, 'Belanja': { icon: 'shopping', color: '#ec4899' }, 'Pendidikan': { icon: 'graduation', color: '#0ea5e9' }, 'Kesehatan': { icon: 'heart', color: '#ef4444' }, 'Utilitas': { icon: 'zap', color: '#f97316' }, 'Kopi & Cafe': { icon: 'coffee', color: '#92400e' }, 'Sewa': { icon: 'home', color: '#6366f1' } };
const FALLBACK_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#0ea5e9', '#ef4444', '#f97316', '#92400e', '#6366f1'];

function getIcon(name) { return ICON_COMPONENTS[name] || Briefcase; }
function getCatColor(cat, i) { return CATEGORY_DEFAULTS[cat?.name]?.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]; }
function getCatIconName(cat) { return CATEGORY_DEFAULTS[cat?.name]?.icon || 'briefcase'; }
function getWalletColor(i) { return ['#10b981', '#2563eb', '#00aed6', '#ee4d2d'][i % 4]; }

async function fetchData() {
  loading.value = true;
  try {
    const [txRes, catRes, walRes, budRes] = await Promise.all([api.get('/transactions'), api.get('/categories'), api.get('/wallets'), api.get('/budgets')]);
    transactions.value = (txRes.data || []).map(t => ({ ...t, category_id: t.category?.id, wallet_id: t.wallet?.id }));
    categories.value = (catRes.data || []).map((c, i) => ({ ...c, _color: getCatColor(c, i), _iconName: getCatIconName(c) }));
    wallets.value = walRes.data || [];
    budgets.value = budRes.data || [];
  } catch (e) { console.error('Fetch error:', e); } finally { loading.value = false; }
}

onMounted(fetchData);

const now = new Date();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const totalIncome = computed(() => transactions.value.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0));
const totalExpense = computed(() => transactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0));
const totalBalance = computed(() => wallets.value.reduce((s, w) => s + Number(w.balance), 0));

const areaChartData = computed(() => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    data.push({
      name: MONTHS[d.getMonth()],
      income: transactions.value.filter(t => t.type === 'income' && t.transaction_date?.startsWith(key)).reduce((s, t) => s + Number(t.amount), 0),
      expense: transactions.value.filter(t => t.type === 'expense' && t.transaction_date?.startsWith(key)).reduce((s, t) => s + Number(t.amount), 0),
    });
  }
  return {
    labels: data.map(d => d.name),
    datasets: [
      { label: 'Pemasukan', data: data.map(d => d.income), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 2, fill: true, pointRadius: 0, tension: 0.3 },
      { label: 'Pengeluaran', data: data.map(d => d.expense), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 2, fill: true, pointRadius: 0, tension: 0.3 },
    ],
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatIDR(ctx.raw) } } },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#6b7a99' } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, color: '#6b7a99', callback: (v) => `${(v / 1000000).toFixed(1)}jt` } } },
};

const pieData = computed(() => categories.value.slice(0, 5).map(cat => ({
  name: cat.name,
  value: transactions.value.filter(t => t.category_id === cat.id && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
  color: cat._color,
})).filter(d => d.value > 0));

const pieChartData = computed(() => ({
  labels: pieData.value.map(d => d.name),
  datasets: [{ data: pieData.value.map(d => d.value), backgroundColor: pieData.value.map(d => d.color), borderWidth: 0, hoverOffset: 4 }],
}));

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true, pointStyle: 'circle', padding: 12, boxWidth: 8 } }, tooltip: { callbacks: { label: (ctx) => formatIDR(ctx.raw) } } },
};

const recentTx = computed(() => [...transactions.value].sort((a, b) => (b.transaction_date || '').localeCompare(a.transaction_date || '')).slice(0, 5));

function saveTx(data) { api.post('/transactions', data).then(() => { showTxModal.value = false; fetchData(); }); }
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-foreground">Ringkasan Keuangan</h1>
        <p class="text-sm text-muted-foreground mt-0.5">{{ MONTHS[now.getMonth()] }} {{ now.getFullYear() }} &middot; Semua Dompet</p>
      </div>
      <button @click="showTxModal = true" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
        <Plus :size="16" /> Tambah
      </button>
    </div>

    <template v-if="!loading">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Saldo" :value="formatShort(totalBalance)" sub="Semua dompet" color="blue" />
        <StatCard label="Total Pemasukan" :value="formatShort(totalIncome)" sub="Bulan ini" color="green" trend="up" />
        <StatCard label="Total Pengeluaran" :value="formatShort(totalExpense)" sub="Bulan ini" color="red" trend="down" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 bg-card rounded-2xl p-5 border border-border shadow-sm">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-sm font-semibold text-foreground">Arus Kas 7 Bulan</h3>
            <div class="flex gap-3 text-xs text-muted-foreground">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Pemasukan</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-rose-400 inline-block" />Pengeluaran</span>
            </div>
          </div>
          <div style="height: 200px;">
            <Bar :data="areaChartData" :options="lineChartOptions" />
          </div>
        </div>
        <div class="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <h3 class="text-sm font-semibold text-foreground mb-5">Pengeluaran per Kategori</h3>
          <div v-if="pieData.length > 0" style="height: 200px;">
            <Doughnut :data="pieChartData" :options="pieChartOptions" />
          </div>
          <div v-else class="flex items-center justify-center h-[200px] text-muted-foreground text-sm">Belum ada data</div>
        </div>
      </div>

      <BudgetWidget :budgets="budgets" :transactions="transactions" :categories="categories" @navigate="router.push({ name: 'budget' })" />

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="(w, wi) in wallets" :key="w.id" class="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-2.5 mb-3">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center" :style="{ backgroundColor: getWalletColor(wi) + '18', color: getWalletColor(wi) }">
              <Banknote :size="16" />
            </div>
            <span class="text-xs font-semibold text-muted-foreground">{{ w.name }}</span>
          </div>
          <p class="text-sm font-bold text-foreground font-mono">{{ formatShort(Number(w.balance)) }}</p>
        </div>
      </div>

      <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="text-sm font-semibold text-foreground">Transaksi Terbaru</h3>
          <span class="text-xs text-muted-foreground">5 terakhir</span>
        </div>
        <div class="divide-y divide-border">
          <div v-for="tx in recentTx" :key="tx.id" class="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: (categories.find(c => c.id === tx.category_id)?._color || '#6b7a99') + '18', color: categories.find(c => c.id === tx.category_id)?._color || '#6b7a99' }">
              <component :is="getIcon(categories.find(c => c.id === tx.category_id)?._iconName || 'briefcase')" :size="14" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">{{ tx.description }}</p>
              <p class="text-xs text-muted-foreground">{{ tx.transaction_date }}</p>
            </div>
            <span class="text-sm font-bold font-mono" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'">
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatShort(Number(tx.amount)) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex items-center justify-center py-20 text-muted-foreground">Memuat data...</div>
    </template>

    <TxModal v-if="showTxModal" :categories="categories" :wallets="wallets" @save="saveTx" @close="showTxModal = false" />
  </div>
</template>
