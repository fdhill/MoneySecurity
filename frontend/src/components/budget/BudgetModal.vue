<script setup>
import { ref, computed } from 'vue'
import { X, Target, Check } from '@lucide/vue'
import { formatShort } from '@/components/common/icons'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  editing: { type: Object, default: null }
})

const emit = defineEmits(['save', 'close'])

const frequencyMap = {
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan'
}
const frequencyKeys = ['weekly', 'monthly', 'yearly']

const selectedCategoryId = ref(props.editing?.category_id ?? null)
const amount = ref(props.editing?.amount ?? '')
const frequency = ref(props.editing?.frequency ?? 'monthly')
const isRecurring = ref(props.editing?.is_recurring ?? true)

const selectedCategory = computed(() =>
  props.categories.find(c => c.id === selectedCategoryId.value) ?? null
)

const expenseCategories = computed(() =>
  props.categories.filter(c => c.type === 'expense')
)

const previewText = computed(() => {
  if (!selectedCategory.value || !amount.value) return null
  const catLabel = selectedCategory.value.name ?? selectedCategory.value.label ?? ''
  const freqLabel = frequencyMap[frequency.value] ?? frequency.value
  return `${catLabel} · Rp ${Number(amount.value).toLocaleString('id-ID')} · ${freqLabel}`
})

const isValid = computed(() => selectedCategoryId.value && amount.value > 0)

function save() {
  if (!isValid.value) return
  emit('save', {
    category_id: selectedCategoryId.value,
    amount: Number(amount.value),
    frequency: frequency.value,
    is_recurring: isRecurring.value
  })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="emit('close')">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />

    <div class="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target class="w-5 h-5 text-emerald-500" />
          {{ editing ? 'Edit Template' : 'Template Baru' }}
        </h2>
        <button
          class="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body -->
      <div class="px-6 py-4 space-y-5">
        <!-- Kategori -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Kategori</label>
          <div class="relative">
            <select
              v-model="selectedCategoryId"
              class="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            >
              <option :value="null" disabled>Pilih kategori</option>
              <option
                v-for="cat in expenseCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.icon ?? '📁' }} {{ cat.name ?? cat.label }}
              </option>
            </select>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Jumlah</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 select-none">Rp</span>
            <input
              v-model="amount"
              type="number"
              min="0"
              placeholder="0"
              class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <!-- Frequency -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">Frekuensi</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="key in frequencyKeys"
              :key="key"
              class="relative px-2 py-2.5 rounded-xl text-xs font-medium transition-all border"
              :class="frequency === key
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'"
              @click="frequency = key"
            >
              <Check
                v-if="frequency === key"
                class="absolute -top-1.5 -right-1.5 w-4 h-4 text-emerald-500 bg-white rounded-full"
              />
              {{ frequencyMap[key] }}
            </button>
          </div>
        </div>

        <!-- Is Recurring -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-800">Berulang</p>
            <p class="text-xs text-gray-400 mt-0.5">Otomatis ditambahkan setiap periode</p>
          </div>
          <button
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            :class="isRecurring ? 'bg-emerald-500' : 'bg-gray-200'"
            @click="isRecurring = !isRecurring"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out"
              :class="isRecurring ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Preview Pill -->
        <div
          v-if="previewText"
          class="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
        >
          <span class="text-lg leading-none">{{ selectedCategory?.icon ?? '📁' }}</span>
          <span class="text-sm font-medium text-emerald-800 truncate">{{ previewText }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-6 pt-2">
        <button
          class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          :class="isValid ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-500/25' : 'bg-gray-300'"
          @click="save"
        >
          {{ editing ? 'Simpan Perubahan' : 'Tambah Template' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slide-up 0.25s ease-out;
}
</style>
