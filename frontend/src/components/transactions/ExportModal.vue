<script setup>
import { ref, computed } from 'vue';
import { X, Download } from '@lucide/vue';

const emit = defineEmits(['close', 'confirm']);

const startDate = ref('');
const endDate = ref('');
const error = ref('');

const invalidRange = computed(
  () => startDate.value && endDate.value && startDate.value > endDate.value,
);

function submit() {
  if (invalidRange.value) {
    error.value = 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai';
    return;
  }
  emit('confirm', {
    start_date: startDate.value || undefined,
    end_date: endDate.value || undefined,
  });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative bg-card rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
      <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
        <h2 class="text-base font-semibold text-foreground">Export Transaksi</h2>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-muted transition-colors"><X :size="18" class="text-muted-foreground" /></button>
      </div>
      <form @submit.prevent="submit" class="px-6 py-5 flex flex-col gap-5">
        <p class="text-sm text-muted-foreground -mt-1">Pilih rentang tanggal untuk diexport. Kosongkan keduanya untuk export semua data.</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tanggal Mulai</label>
            <input type="date" v-model="startDate" :max="endDate || undefined"
              class="w-full px-3.5 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tanggal Selesai</label>
            <input type="date" v-model="endDate" :min="startDate || undefined"
              class="w-full px-3.5 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <p v-if="error" class="text-xs text-rose-500 -mt-3">{{ error }}</p>
        <button type="submit" class="w-full py-3.5 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity mt-1 flex items-center justify-center gap-2">
          <Download :size="16" /> Export
        </button>
      </form>
    </div>
  </div>
</template>
