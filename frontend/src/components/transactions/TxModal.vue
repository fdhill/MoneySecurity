<script setup>
import { ref } from 'vue';
import { X } from '@lucide/vue';

const props = defineProps({ categories: Array, wallets: Array, editing: Object });
const emit = defineEmits(['save', 'close']);

const form = ref({
  type: props.editing?.type || 'expense',
  amount: props.editing ? String(props.editing.amount) : '',
  transaction_date: props.editing?.transaction_date || new Date().toISOString().slice(0, 10),
  category_id: props.editing?.category_id || props.categories?.[0]?.id || '',
  wallet_id: props.editing?.wallet_id || props.wallets?.[0]?.id || '',
  description: props.editing?.description || '',
});

function formatAmount(v) { return v ? Number(v).toLocaleString('id-ID') : ''; }
function handleAmount(e) { form.value.amount = e.target.value.replace(/\D/g, ''); }

function submit() {
  const amt = parseFloat(form.value.amount);
  if (!amt || amt <= 0) return;
  emit('save', { ...form.value, amount: amt });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
        <h2 class="text-base font-semibold text-foreground">{{ editing ? 'Edit Transaksi' : 'Tambah Transaksi' }}</h2>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-muted transition-colors"><X :size="18" class="text-muted-foreground" /></button>
      </div>
      <form @submit.prevent="submit" class="px-6 py-5 flex flex-col gap-5">
        <div class="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
          <button v-for="t in ['expense', 'income']" :key="t" type="button" @click="form.type = t"
            class="py-2.5 rounded-lg text-sm font-semibold transition-all"
            :class="form.type === t ? (t === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm') : 'text-muted-foreground hover:text-foreground'">
            {{ t === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
          </button>
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nominal</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rp</span>
            <input type="text" inputMode="numeric" placeholder="0" :value="formatAmount(form.amount)" @input="handleAmount"
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-input-background font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tanggal</label>
          <input type="date" v-model="form.transaction_date"
            class="w-full px-3.5 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Kategori</label>
            <select v-model="form.category_id" class="w-full px-3 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Dompet</label>
            <select v-model="form.wallet_id" class="w-full px-3 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Catatan</label>
          <input type="text" placeholder="Deskripsi singkat..." v-model="form.description"
            class="w-full px-3.5 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity mt-1">
          {{ editing ? 'Simpan Perubahan' : 'Simpan Transaksi' }}
        </button>
      </form>
    </div>
  </div>
</template>
