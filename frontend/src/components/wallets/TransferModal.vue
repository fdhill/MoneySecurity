<script setup>
import { ref, computed } from 'vue';
import { X } from '@lucide/vue';
import { formatIDR } from '@/components/common/icons';

const props = defineProps({ wallets: Array });
const emit = defineEmits(['save', 'close']);

const form = ref({
  source_wallet_id: props.wallets?.[0]?.id || '',
  destination_wallet_id: props.wallets?.[1]?.id || '',
  amount: '',
});

const sourceWallet = computed(() =>
  props.wallets?.find((w) => w.id === form.value.source_wallet_id),
);

const error = computed(() => {
  if (!form.value.source_wallet_id || !form.value.destination_wallet_id) return '';
  if (form.value.source_wallet_id === form.value.destination_wallet_id) {
    return 'Dompet asal dan tujuan tidak boleh sama';
  }
  const amt = parseFloat(form.value.amount);
  if (amt > Number(sourceWallet.value?.balance)) return 'Saldo dompet asal tidak mencukupi';
  return '';
});

function handleAmount(e) { form.value.amount = e.target.value.replace(/\D/g, ''); }

function submit() {
  const amt = parseFloat(form.value.amount);
  if (!amt || amt <= 0 || error.value) return;
  emit('save', { ...form.value, amount: amt });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl max-h-[92vh] overflow-y-auto">
      <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
        <h2 class="text-base font-semibold text-foreground">Transfer Antar Dompet</h2>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-muted transition-colors"><X :size="18" class="text-muted-foreground" /></button>
      </div>
      <form @submit.prevent="submit" class="px-6 py-5 flex flex-col gap-5">
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Dari Dompet</label>
          <select v-model="form.source_wallet_id" class="w-full px-3 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
            <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }} · {{ formatIDR(Number(w.balance)) }}</option>
          </select>
        </div>
        <div class="flex justify-center -my-3">
          <span class="text-xs font-medium text-muted-foreground">&darr;</span>
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Ke Dompet</label>
          <select v-model="form.destination_wallet_id" class="w-full px-3 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
            <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }} · {{ formatIDR(Number(w.balance)) }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nominal</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
            <input inputmode="numeric" placeholder="0" :value="form.amount ? formatAmount(form.amount) : ''" @input="handleAmount"
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-input-background font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <p v-if="error" class="text-xs text-rose-500 mt-1.5">{{ error }}</p>
        </div>
        <button type="submit" :disabled="!!error || !parseFloat(form.amount)"
          class="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1">
          Transfer Sekarang
        </button>
      </form>
    </div>
  </div>
</template>
