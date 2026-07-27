<script setup>
import { ref } from 'vue';
import { X, Check } from '@lucide/vue';

const props = defineProps({ editing: Object });
const emit = defineEmits(['save', 'close']);

const COLORS = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ec4899','#0ea5e9','#ef4444','#f97316','#92400e','#6366f1'];

const name = ref(props.editing?.name || '');
const type = ref(props.editing?.type || 'expense');
const color = ref(props.editing?._color || COLORS[0]);

function submit(e) {
  e.preventDefault();
  if (!name.value.trim()) return;
  emit('save', { name: name.value.trim(), type: type.value, _color: color.value });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    <div class="relative bg-card rounded-2xl w-full max-w-sm shadow-2xl p-6 mx-4">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold">{{ editing ? 'Edit Kategori' : 'Tambah Kategori' }}</h2>
        <button @click="emit('close')" class="p-1.5 rounded-lg hover:bg-muted"><X :size="16" /></button>
      </div>
      <form @submit="submit" class="flex flex-col gap-4">
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nama Kategori</label>
          <input v-model="name" placeholder="cth: Makanan, Gaji, Transportasi"
            class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tipe</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" @click="type = 'expense'"
              class="py-2.5 rounded-xl border text-xs font-medium transition-all"
              :class="type === 'expense' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:border-primary/40'">
              Pengeluaran
            </button>
            <button type="button" @click="type = 'income'"
              class="py-2.5 rounded-xl border text-xs font-medium transition-all"
              :class="type === 'income' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:border-primary/40'">
              Pemasukan
            </button>
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Warna Badge</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="c in COLORS" :key="c" type="button" @click="color = c"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              :style="{ backgroundColor: c }">
              <Check v-if="color === c" :size="12" class="text-white" />
            </button>
          </div>
        </div>
        <div class="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
          <div class="w-10 h-10 rounded-full flex items-center justify-center" :style="{ backgroundColor: color + '22', color }">
            <span class="text-xs font-bold">{{ name ? name.charAt(0).toUpperCase() : '?' }}</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">{{ name || 'Nama Kategori' }}</p>
            <p class="text-xs text-muted-foreground">{{ type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</p>
          </div>
        </div>
        <button type="submit" class="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          {{ editing ? 'Simpan Perubahan' : 'Tambah Kategori' }}
        </button>
      </form>
    </div>
  </div>
</template>
