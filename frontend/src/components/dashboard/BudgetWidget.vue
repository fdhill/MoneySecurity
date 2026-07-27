<script setup>
import { computed } from 'vue';
import { Target, ChevronRight, Sparkles, Check, Flame } from '@lucide/vue';
import { formatShort, formatIDR, ICON_MAP } from '@/components/common/icons';

const props = defineProps({
  budgets: Array,
  transactions: Array,
  categories: Array,
});

const emit = defineEmits(['navigate']);

const totalLimit = computed(() => props.budgets.reduce((s, b) => s + Number(b.amount), 0));

const totalSpent = computed(() => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return props.budgets.reduce((s, b) => {
    return s + props.transactions
      .filter(t => t.type === 'expense' && t.category_id === b.category_id
        && t.transaction_date >= start && t.transaction_date <= end)
      .reduce((a, t) => a + Number(t.amount), 0);
  }, 0);
});

const remaining = computed(() => totalLimit.value - totalSpent.value);
const pct = computed(() => totalLimit.value > 0 ? Math.min(100, Math.round((totalSpent.value / totalLimit.value) * 100)) : 0);

const now = new Date();
const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const daysPassed = now.getDate();
const daysRemaining = totalDays - daysPassed;

const idealSpentSoFar = computed(() => (totalLimit.value / totalDays) * daysPassed);
const pace = computed(() => totalSpent.value / Math.max(1, idealSpentSoFar.value));
const status = computed(() => pace.value > 1.15 ? 'boros' : pace.value < 0.85 ? 'hemat' : 'normal');
const adaptiveDaily = computed(() => daysRemaining > 0 ? Math.max(0, remaining.value / daysRemaining) : 0);

const statusCfg = computed(() => ({
  hemat: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', icon: Sparkles, msg: 'Kamu hemat! Boleh agak longgar hari ini.' },
  normal: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', icon: Check, msg: 'Pengeluaran on track. Pertahankan!' },
  boros: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700', icon: Flame, msg: 'Kamu overspend! Perlu lebih hemat.' },
}[status.value]));

const barColor = computed(() => pct.value >= 90 ? 'bg-rose-500' : pct.value >= 70 ? 'bg-amber-400' : 'bg-emerald-500');

const PERIOD_START = computed(() => new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
const PERIOD_END = computed(() => new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));
</script>

<template>
  <div class="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target :size="16" class="text-primary" />
        </div>
        <div>
          <p class="text-sm font-semibold text-foreground">Anggaran Bulan Ini</p>
          <p class="text-xs text-muted-foreground">{{ budgets.length }} template aktif &middot; {{ PERIOD_START }} – {{ PERIOD_END }}</p>
        </div>
      </div>
      <button @click="emit('navigate')" class="text-xs font-medium text-primary hover:underline flex items-center gap-1">
        Lihat Detail <ChevronRight :size="12" />
      </button>
    </div>

    <div>
      <div class="flex items-center justify-between mb-1.5 text-xs">
        <span class="text-muted-foreground">Terpakai {{ pct }}%</span>
        <span class="font-mono font-bold text-foreground">{{ formatShort(totalSpent) }} / {{ formatShort(totalLimit) }}</span>
      </div>
      <div class="h-2.5 bg-muted rounded-full overflow-hidden">
        <div :class="[barColor, 'h-full rounded-full transition-all duration-500']" :style="{ width: pct + '%' }" />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <div class="text-center p-2.5 rounded-xl bg-muted">
        <p class="text-xs text-muted-foreground">Total Anggaran</p>
        <p class="text-sm font-bold font-mono text-foreground mt-0.5">{{ formatShort(totalLimit) }}</p>
      </div>
      <div class="text-center p-2.5 rounded-xl bg-muted">
        <p class="text-xs text-muted-foreground">Terpakai</p>
        <p class="text-sm font-bold font-mono text-rose-500 mt-0.5">{{ formatShort(totalSpent) }}</p>
      </div>
      <div class="text-center p-2.5 rounded-xl bg-muted">
        <p class="text-xs text-muted-foreground">Sisa</p>
        <p class="text-sm font-bold font-mono mt-0.5" :class="remaining >= 0 ? 'text-emerald-600' : 'text-rose-500'">
          {{ formatShort(Math.abs(remaining)) }}
        </p>
      </div>
    </div>

    <div :class="[statusCfg.bg, statusCfg.text, 'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium']">
      <component :is="statusCfg.icon" :size="13" />
      <span>{{ statusCfg.msg }}</span>
      <span :class="[statusCfg.badge, 'ml-auto px-2 py-0.5 rounded-lg text-xs font-semibold']">
        {{ status === 'hemat' ? 'Hemat' : status === 'boros' ? 'Boros' : 'Normal' }}
      </span>
    </div>

    <div class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
      <div>
        <p class="text-xs text-muted-foreground">Rekomendasi batas / hari</p>
        <p class="text-sm font-bold font-mono text-primary mt-0.5">{{ formatIDR(Math.round(adaptiveDaily)) }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-muted-foreground">{{ daysRemaining }} hari tersisa</p>
        <p class="text-xs text-muted-foreground">dari {{ totalDays }} hari</p>
      </div>
    </div>
  </div>
</template>
