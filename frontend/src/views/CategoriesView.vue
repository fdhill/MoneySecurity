<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-foreground">Kategori</h1>
        <p class="text-sm text-muted-foreground mt-0.5">{{ categories.length }} kategori</p>
      </div>
      <button @click="openModal(null)" class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
        <Plus :size="16" /> Tambah
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>

    <div v-else-if="categories.length === 0" class="py-20 text-center text-muted-foreground text-sm">
      Belum ada kategori.
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(cat, index) in categories"
        :key="cat.id"
        class="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-xl"
              :style="{ backgroundColor: categoryColors[index % categoryColors.length] + '20' }"
            >
              <Briefcase :size="20" :style="{ color: categoryColors[index % categoryColors.length] }" />
            </div>
            <div>
              <h3 class="font-semibold text-foreground">{{ cat.name }}</h3>
              <p class="text-xs text-muted-foreground">{{ cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</p>
            </div>
          </div>
          <div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button class="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" @click="openModal(cat)">
              <Edit2 :size="14" />
            </button>
            <button class="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors" @click="deleteCategory(cat)">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Transaksi</span>
            <span class="font-medium text-foreground">{{ getCategoryStats(cat.id).count }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Total</span>
            <span class="font-semibold text-foreground">{{ formatShort(getCategoryStats(cat.id).total) }}</span>
          </div>
          <div class="pt-1">
            <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{ width: getCategoryStats(cat.id).percent + '%', backgroundColor: categoryColors[index % categoryColors.length] }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <CatModal v-if="showModal" :editing="editingCategory" @close="showModal = false" @save="onSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit2, Trash2, Briefcase } from '@lucide/vue'
import CatModal from '@/components/categories/CatModal.vue'
import { formatShort } from '@/components/common/icons'
import api from '@/services/api'

const categories = ref([])
const transactions = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingCategory = ref(null)

const categoryColors = [
  '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
  '#0ea5e9', '#ef4444', '#f97316', '#92400e', '#6366f1',
]

const maxTotal = computed(() => {
  if (categories.value.length === 0) return 0
  let max = 0
  for (const cat of categories.value) {
    const s = getCategoryStats(cat.id)
    if (s.total > max) max = s.total
  }
  return max
})

function getCategoryStats(categoryId) {
  const catTx = transactions.value.filter((t) => t.category_id === categoryId)
  const total = catTx.reduce((sum, t) => sum + Number(t.amount), 0)
  const count = catTx.length
  const percent = maxTotal.value > 0 ? Math.round((total / maxTotal.value) * 100) : 0
  return { count, total, percent }
}

function openModal(category) {
  editingCategory.value = category
  showModal.value = true
}

async function onSaved() {
  showModal.value = false
  await fetchData()
}

async function deleteCategory(cat) {
  if (!confirm(`Hapus kategori "${cat.name}"?`)) return
  try {
    await api.delete(`/categories/${cat.id}`)
    await fetchData()
  } catch (e) {
    console.error('Gagal menghapus kategori', e)
  }
}

async function fetchData() {
  loading.value = true
  try {
    const [catRes, txRes] = await Promise.all([
      api.get('/categories'),
      api.get('/transactions'),
    ])
    categories.value = catRes.data
    transactions.value = txRes.data
  } catch (e) {
    console.error('Gagal memuat data', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
