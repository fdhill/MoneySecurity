<script setup>
import { ref } from 'vue';
import { X, Banknote } from '@lucide/vue';

const props = defineProps({ editing: Object });
const emit = defineEmits(['save', 'close']);

const name = ref(props.editing?.name || '');
const balance = ref(props.editing ? String(props.editing.balance) : '');

function submit(e) {
  e.preventDefault();
  if (!name.value.trim()) return;
  emit('save', { name: name.value.trim(), balance: parseFloat(balance.value.replace(/\D/g, '')) || 0 });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative bg-card rounded-2xl w-full max-w-sm shadow-2xl p-6 mx-4">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold">{{ editing ? 'Edit Dompet' : 'Tambah Dompet' }}</h2>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-muted"><X :size="16" /></button>
      </div>
      <form @submit="submit" class="flex flex-col gap-4">
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nama Dompet</label>
          <input v-model="name" placeholder="cth: Dana, BRI, OVO"
            class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{{ editing ? 'Saldo Saat Ini' : 'Saldo Awal' }}</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rp</span>
            <input type="text" inputMode="numeric" placeholder="0"
              :value="balance ? Number(balance).toLocaleString('id-ID') : ''"
              @input="balance = $event.target.value.replace(/\D/g, '')"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
            <Banknote :size="20" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">{{ name || 'Nama Dompet' }}</p>
            <p class="text-xs font-mono text-muted-foreground">Rp {{ balance ? Number(balance).toLocaleString('id-ID') : '0' }}</p>
          </div>
        </div>
        <button type="submit" class="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          {{ editing ? 'Simpan Perubahan' : 'Tambah Dompet' }}
        </button>
      </form>
    </div>
  </div>
</template>
