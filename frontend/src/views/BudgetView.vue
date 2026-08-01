<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit2, Trash2, Target, Sparkles, Check, Flame } from '@lucide/vue'
import BudgetModal from '@/components/budget/BudgetModal.vue'
import { formatIDR, formatShort } from '@/components/common/icons'
import { budgetService } from '@/services/budgetService'
import { transactionService } from '@/services/transactionService'
import { categoryService } from '@/services/categoryService'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const budgets = ref([])
const transactions = ref([])
const categories = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingBudget = ref(null)

const FREQUENCY_LABELS = { weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan' }

const CATEGORY_DEFAULTS = {
  'Makanan': { icon: 'utensils', color: '#f59e0b' },
  'Transportasi': { icon: 'car', color: '#3b82f6' },
  'Gaji': { icon: 'briefcase', color: '#10b981' },
  'Hiburan': { icon: 'music', color: '#8b5cf6' },
  'Belanja': { icon: 'shopping', color: '#ec4899' },
  'Pendidikan': { icon: 'graduation', color: '#0ea5e9' },
  'Kesehatan': { icon: 'heart', color: '#ef4444' },
  'Utilitas': { icon: 'zap', color: '#f97316' },
  'Kopi & Cafe': { icon: 'coffee', color: '#92400e' },
  'Sewa': { icon: 'home', color: '#6366f1' },
}
const FALLBACK_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#0ea5e9', '#ef4444', '#f97316', '#92400e', '#6366f1']

function getCatColor(cat, i) {
  return CATEGORY_DEFAULTS[cat?.name]?.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]
}
function getCatById(id) {
  return categories.value.find(c => c.id === id)
}

const now = new Date()
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const periodLabel = computed(() => `${MONTHS[now.getMonth()]} ${now.getFullYear()}`)

const currentYear = now.getFullYear()
const currentMonth = now.getMonth()
const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
const daysPassed = now.getDate()
const daysRemaining = Math.max(1, daysInMonth - daysPassed)

const templatesWithStats = computed(() => {
  return budgets.value.map((b, i) => {
    const cat = getCatById(b.category_id)
    const spent = transactions.value
      .filter(t => t.category_id === b.category_id && t.type === 'expense' && t.transaction_date?.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`))
      .reduce((s, t) => s + Number(t.amount), 0)
    const amount = Number(b.amount)
    const remaining = Math.max(0, amount - spent)
    const pct = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0
    const dailyBudget = b.frequency === 'daily' ? amount : b.frequency === 'weekly' ? amount / 7 : b.frequency === 'yearly' ? amount / 365 : amount / daysInMonth
    const pace = dailyBudget * daysPassed > 0 ? spent / (dailyBudget * daysPassed) : 0
    let status = 'normal'
    if (pace > 1.15) status = 'boros'
    else if (pace < 0.85) status = 'hemat'
    const adaptiveDaily = daysRemaining > 0 ? remaining / daysRemaining : remaining
    return {
      ...b,
      _cat: cat,
      _color: getCatColor(cat, i),
      _spent: spent,
      _remaining: remaining,
      _pct: pct,
      _status: status,
      _adaptiveDaily: adaptiveDaily,
    }
  })
})

const totalBudget = computed(() => templatesWithStats.value.reduce((s, t) => s + Number(t.amount), 0))
const totalSpent = computed(() => templatesWithStats.value.reduce((s, t) => s + t._spent, 0))
const totalRemaining = computed(() => Math.max(0, totalBudget.value - totalSpent.value))
const totalPct = computed(() => totalBudget.value > 0 ? Math.min(100, Math.round((totalSpent.value / totalBudget.value) * 100)) : 0)

function progressColor(pct) {
  if (pct > 90) return 'bg-rose-500'
  if (pct >= 70) return 'bg-amber-400'
  return 'bg-emerald-500'
}
function progressColorHex(pct) {
  if (pct > 90) return '#ef4444'
  if (pct >= 70) return '#fbbf24'
  return '#10b981'
}
function statusBadge(status) {
  if (status === 'boros') return { label: 'Boros', class: 'bg-rose-50 text-rose-600 border-rose-200', icon: Flame }
  if (status === 'hemat') return { label: 'Hemat', class: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: Check }
  return { label: 'Normal', class: 'bg-blue-50 text-blue-600 border-blue-200', icon: Target }
}

async function fetchData() {
  loading.value = true
  try {
    const [budRes, txRes, catRes] = await Promise.all([
      budgetService.list(),
      transactionService.list(),
      categoryService.list(),
    ])
    budgets.value = budRes.data || []
    transactions.value = (txRes.data || []).map(t => ({ ...t, category_id: t.category?.id, wallet_id: t.wallet?.id }))
    categories.value = catRes.data || []
  } catch (e) {
    console.error('Fetch error:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function openAdd() {
  editingBudget.value = null
  showModal.value = true
}
function openEdit(b) {
  editingBudget.value = b
  showModal.value = true
}
async function saveBudget(data) {
  try {
    const res = editingBudget.value
      ? await budgetService.update(editingBudget.value.id, data)
      : await budgetService.create(data)
    showToast(res?.message, 'success')
    showModal.value = false
    editingBudget.value = null
    fetchData()
  } catch (e) {
    showToast(e?.message, 'error')
  }
}
async function deleteBudget(id) {
  if (!confirm('Hapus template anggaran ini?')) return
  try {
    const res = await budgetService.remove(id)
    showToast(res?.message, 'success')
    fetchData()
  } catch (e) {
    showToast(e?.message, 'error')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-xl font-bold text-foreground">Anggaran & Budgeting</h1>
        <p class="text-sm text-muted-foreground mt-0.5">{{ periodLabel }} &middot; {{ budgets.length }} template aktif</p>
      </div>
      <button
        @click="openAdd"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
      >
        <Plus :size="16" /> Tambah Template
      </button>
    </div>

    <template v-if="!loading">
      <!-- Summary Bar -->
      <div class="bg-card rounded-2xl p-5 border border-border shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-foreground">Ringkasan Anggaran</h3>
          <span class="text-xs font-mono text-muted-foreground">{{ totalPct }}% terpakai</span>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p class="text-xs text-muted-foreground mb-1">Total Anggaran</p>
            <p class="text-base font-bold text-foreground font-mono">{{ formatShort(totalBudget) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Total Terpakai</p>
            <p class="text-base font-bold text-rose-500 font-mono">{{ formatShort(totalSpent) }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground mb-1">Sisa</p>
            <p class="text-base font-bold text-emerald-600 font-mono">{{ formatShort(totalRemaining) }}</p>
          </div>
        </div>
        <div class="w-full h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="progressColor(totalPct)"
            :style="{ width: totalPct + '%' }"
          />
        </div>
      </div>

      <!-- Template Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="t in templatesWithStats"
          :key="t.id"
          class="group bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3.5"
        >
          <!-- Top row: category + frequency + badges -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                :style="{ backgroundColor: t._color + '18', color: t._color }"
              >
                <Target :size="18" />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">{{ t._cat?.name || 'Kategori' }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-xs text-muted-foreground">{{ FREQUENCY_LABELS[t.frequency] || t.frequency }}</span>
                  <span v-if="t.is_recurring" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-semibold">
                    Berulang
                  </span>
                </div>
              </div>
            </div>
            <!-- Edit/Delete on hover -->
            <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="openEdit(t)"
                class="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-muted-foreground transition-colors"
              >
                <Edit2 :size="14" />
              </button>
              <button
                @click="deleteBudget(t.id)"
                class="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-500 text-muted-foreground transition-colors"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <!-- Amount / Spent / Remaining -->
          <div class="grid grid-cols-3 gap-2">
            <div>
              <p class="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">Anggaran</p>
              <p class="text-sm font-bold text-foreground font-mono">{{ formatShort(Number(t.amount)) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">Terpakai</p>
              <p class="text-sm font-bold font-mono" :class="t._pct > 90 ? 'text-rose-500' : 'text-foreground'">{{ formatShort(t._spent) }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">Sisa</p>
              <p class="text-sm font-bold font-mono" :class="t._remaining > 0 ? 'text-emerald-600' : 'text-rose-500'">{{ formatShort(t._remaining) }}</p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div>
            <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="progressColor(t._pct)"
                :style="{ width: t._pct + '%' }"
              />
            </div>
            <p class="text-[10px] text-muted-foreground mt-1 text-right font-mono">{{ t._pct }}%</p>
          </div>

          <!-- Status Badge -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold"
                :class="statusBadge(t._status).class"
              >
                <component :is="statusBadge(t._status).icon" :size="11" />
                {{ statusBadge(t._status).label }}
              </span>
            </div>
            <!-- Adaptive daily recommendation -->
            <div class="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Sparkles :size="11" class="text-amber-400" />
              <span>Sisa/hari: <span class="font-semibold text-foreground font-mono">{{ formatShort(Math.round(t._adaptiveDaily)) }}</span></span>
            </div>
          </div>
        </div>

        <!-- Dashed "Add New" Card -->
        <button
          @click="openAdd"
          class="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 p-6 min-h-[240px] text-muted-foreground hover:text-primary group"
        >
          <div class="w-12 h-12 rounded-2xl border-2 border-dashed border-current flex items-center justify-center group-hover:border-solid transition-all">
            <Plus :size="22" />
          </div>
          <span class="text-sm font-semibold">Tambah Template Baru</span>
          <span class="text-xs text-center">Buat anggaran baru untuk kategori pengeluaran</span>
        </button>
      </div>

      <!-- Summary Table (Desktop) / List (Mobile) -->
      <div class="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="text-sm font-semibold text-foreground">Detail Anggaran</h3>
          <span class="text-xs text-muted-foreground">{{ templatesWithStats.length }} kategori</span>
        </div>

        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border bg-muted/40">
                <th class="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-3.5">Kategori</th>
                <th class="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Frekuensi</th>
                <th class="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Anggaran</th>
                <th class="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Terpakai</th>
                <th class="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Sisa</th>
                <th class="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Persentase</th>
                <th class="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-if="templatesWithStats.length === 0">
                <td colspan="7" class="text-center py-16 text-muted-foreground text-sm">Belum ada template anggaran</td>
              </tr>
              <tr
                v-for="t in templatesWithStats"
                :key="t.id"
                class="hover:bg-muted/20 transition-colors group"
              >
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      :style="{ backgroundColor: t._color + '18', color: t._color }"
                    >
                      <Target :size="14" />
                    </div>
                    <span class="text-sm font-medium text-foreground">{{ t._cat?.name || 'Kategori' }}</span>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm text-muted-foreground">{{ FREQUENCY_LABELS[t.frequency] }}</span>
                    <span v-if="t.is_recurring" class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-semibold">
                      Berulang
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3.5 text-right text-sm font-bold font-mono text-foreground">{{ formatIDR(Number(t.amount)) }}</td>
                <td class="px-4 py-3.5 text-right text-sm font-bold font-mono" :class="t._pct > 90 ? 'text-rose-500' : 'text-foreground'">{{ formatIDR(t._spent) }}</td>
                <td class="px-4 py-3.5 text-right text-sm font-bold font-mono" :class="t._remaining > 0 ? 'text-emerald-600' : 'text-rose-500'">{{ formatIDR(t._remaining) }}</td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="progressColor(t._pct)"
                        :style="{ width: t._pct + '%' }"
                      />
                    </div>
                    <span class="text-xs font-mono text-muted-foreground w-8 text-right">{{ t._pct }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold"
                    :class="statusBadge(t._status).class"
                  >
                    <component :is="statusBadge(t._status).icon" :size="11" />
                    {{ statusBadge(t._status).label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile List -->
        <div class="md:hidden divide-y divide-border">
          <div v-if="templatesWithStats.length === 0" class="text-center py-16 text-muted-foreground text-sm">Belum ada template anggaran</div>
          <div v-for="t in templatesWithStats" :key="t.id" class="px-4 py-3.5">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                :style="{ backgroundColor: t._color + '18', color: t._color }"
              >
                <Target :size="14" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ t._cat?.name || 'Kategori' }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-muted-foreground">{{ FREQUENCY_LABELS[t.frequency] }}</span>
                  <span v-if="t.is_recurring" class="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-semibold">
                    Berulang
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold"
                  :class="statusBadge(t._status).class"
                >
                  <component :is="statusBadge(t._status).icon" :size="11" />
                  {{ statusBadge(t._status).label }}
                </span>
                <button @click="openEdit(t)" class="p-1 text-muted-foreground hover:text-blue-600 transition-colors"><Edit2 :size="14" /></button>
                <button @click="deleteBudget(t.id)" class="p-1 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 :size="14" /></button>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-2.5">
              <div>
                <p class="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Anggaran</p>
                <p class="text-xs font-bold font-mono text-foreground">{{ formatShort(Number(t.amount)) }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Terpakai</p>
                <p class="text-xs font-bold font-mono" :class="t._pct > 90 ? 'text-rose-500' : 'text-foreground'">{{ formatShort(t._spent) }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Sisa</p>
                <p class="text-xs font-bold font-mono" :class="t._remaining > 0 ? 'text-emerald-600' : 'text-rose-500'">{{ formatShort(t._remaining) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="progressColor(t._pct)"
                  :style="{ width: t._pct + '%' }"
                />
              </div>
              <span class="text-[11px] font-mono text-muted-foreground">{{ t._pct }}%</span>
              <div class="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Sparkles :size="10" class="text-amber-400" />
                <span class="font-mono">{{ formatShort(Math.round(t._adaptiveDaily)) }}/hr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <template v-else>
      <div class="flex items-center justify-center py-20 text-muted-foreground">Memuat data anggaran...</div>
    </template>

    <!-- Budget Modal -->
    <BudgetModal
      v-if="showModal"
      :categories="categories"
      :editing="editingBudget"
      @save="saveBudget"
      @close="showModal = false; editingBudget = null"
    />
  </div>
</template>
