<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MessageCircle, Link, Copy, Check, RefreshCw, Clock, Send, Info } from '@lucide/vue'
import { telegramService } from '@/services/telegramService'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const botUsername = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME || '').trim().replace(/^@/, '')
const botLink = botUsername ? `https://t.me/${botUsername}` : ''

const status = ref(null)
const linkCode = ref('')
const expiresAt = ref(null)
const now = ref(Date.now())
const loading = ref(true)
const generating = ref(false)
const copied = ref(false)

let pollTimer = null
let clockTimer = null

const isLinked = computed(() => !!status.value?.linked)

const timeLeft = computed(() => {
  if (!expiresAt.value) return 0
  return Math.max(0, new Date(expiresAt.value) - now.value)
})

const isExpired = computed(() => linkCode.value !== '' && timeLeft.value <= 0)

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatCountdown(ms) {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function stopTimers() {
  if (pollTimer) clearInterval(pollTimer)
  if (clockTimer) clearInterval(clockTimer)
  pollTimer = null
  clockTimer = null
}

function tickClock() {
  now.value = Date.now()
  if (timeLeft.value <= 0) {
    stopTimers()
  }
}

async function fetchStatus() {
  try {
    const res = await telegramService.getStatus()
    status.value = res.data
    if (res.data.linked) {
      stopTimers()
      linkCode.value = ''
      expiresAt.value = null
    }
  } catch (e) {
    console.error('Fetch telegram status error:', e)
  } finally {
    loading.value = false
  }
}

async function generateCode() {
  generating.value = true
  try {
    const res = await telegramService.generateLinkToken()
    linkCode.value = res.data.token
    expiresAt.value = res.data.expires_at
    copied.value = false
    now.value = Date.now()
    stopTimers()
    clockTimer = setInterval(tickClock, 1000)
    pollTimer = setInterval(fetchStatus, 5000)
  } catch (e) {
    showToast(e?.message, 'error')
  } finally {
    generating.value = false
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(linkCode.value)
    copied.value = true
    showToast('Kode link disalin', 'success')
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    showToast('Gagal menyalin kode', 'error')
  }
}

onMounted(fetchStatus)
onUnmounted(stopTimers)
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">Bot Telegram</h1>
      <p class="text-sm text-muted-foreground mt-1">Catat transaksi langsung dari Telegram</p>
    </div>

    <!-- Status Card -->
    <div
      class="rounded-2xl p-5 border border-border transition-colors duration-300"
      :class="isLinked ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-muted/40'"
    >
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300"
            :class="isLinked ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-card border border-border'"
          >
            <MessageCircle
              class="w-6 h-6 transition-colors duration-300"
              :class="isLinked ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'"
            />
          </div>
          <div>
            <p
              class="font-semibold transition-colors duration-300"
              :class="isLinked ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'"
            >
              {{ loading ? 'Memeriksa status...' : isLinked ? 'Terhubung' : 'Belum Terhubung' }}
            </p>
            <p v-if="isLinked" class="text-xs text-muted-foreground mt-0.5">
              Chat ID: <span class="font-mono">{{ status.chat_id }}</span>
            </p>
            <p v-else class="text-xs text-muted-foreground mt-0.5">
              Hubungkan akun untuk mencatat transaksi lewat Telegram
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="isLinked"
            @click="fetchStatus"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <RefreshCw :size="15" /> Refresh
          </button>
          <button
            v-else
            @click="generateCode"
            :disabled="generating"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link :size="15" :class="generating ? 'animate-pulse' : ''" />
            {{ generating ? 'Membuat...' : 'Buat Kode Link' }}
          </button>
        </div>
      </div>

      <p v-if="isLinked" class="text-xs text-muted-foreground mt-3">
        Untuk memutus koneksi, kirim <code class="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">/unlink</code> ke bot di Telegram.
      </p>
    </div>

    <!-- Link Code Card -->
    <div v-if="linkCode" class="bg-card rounded-2xl p-5 border border-border space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-foreground">Kode Link</h2>
        <span
          class="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border"
          :class="isExpired
            ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30'
            : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30'"
        >
          <Clock :size="12" />
          {{ isExpired ? 'Kedaluwarsa' : `Berlaku ${formatCountdown(timeLeft)}` }}
        </span>
      </div>

      <div v-if="!isExpired" class="flex items-center gap-3">
        <div class="flex-1 rounded-xl bg-muted border border-border px-4 py-3.5 text-center">
          <span class="text-2xl font-mono font-bold tracking-widest text-foreground select-all">{{ linkCode }}</span>
        </div>
        <button
          @click="copyCode"
          class="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition"
        >
          <Check v-if="copied" :size="16" />
          <Copy v-else :size="16" />
          {{ copied ? 'Tersalin' : 'Salin' }}
        </button>
      </div>

      <p v-else class="text-sm text-muted-foreground">
        Kode sudah kedaluwarsa. Buat kode baru untuk menghubungkan akun.
      </p>

      <div class="rounded-xl bg-muted/50 border border-border p-4 space-y-2 text-sm">
        <p class="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Cara menghubungkan</p>
        <p class="text-foreground">
          1. Buka Telegram, cari bot
          <span v-if="botLink">
            <a :href="botLink" target="_blank" rel="noopener" class="text-primary underline">{{ botUsername }}</a>
          </span>
          <span v-else class="font-medium">{{ botUsername || 'MoneySecurity' }}</span>
        </p>
        <p class="text-foreground">
          2. Kirim <code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">/link {{ linkCode }}</code> ke bot
        </p>
        <p class="text-foreground">3. Status di atas otomatis berubah menjadi "Terhubung"</p>
        <p class="text-xs text-muted-foreground">Kode berlaku hingga {{ formatTime(expiresAt) }} dan hanya bisa dipakai sekali.</p>
      </div>
    </div>

    <!-- Cara Pakai -->
    <div class="bg-card rounded-2xl p-5 border border-border">
      <h2 class="font-semibold text-foreground mb-4">Cara Pakai</h2>
      <div class="grid gap-4">
        <div v-for="(step, i) in [
          { title: 'Hubungkan akun', desc: 'Buat kode link di halaman ini, lalu kirim /link <KODE> ke bot di Telegram.' },
          { title: 'Catat transaksi', desc: 'Kirim /transaksi untuk panduan bertahap, atau langsung tulis format satu baris seperti pengeluaran_makan_cash_50000.' },
          { title: 'Semua tersinkron', desc: 'Transaksi langsung tersimpan ke akun dan terlihat di aplikasi.' },
        ]" :key="i" class="flex items-start gap-3">
          <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
            {{ i + 1 }}
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">{{ step.title }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Perintah Bot -->
    <div class="bg-card rounded-2xl p-5 border border-border">
      <h2 class="font-semibold text-foreground mb-3">Perintah Bot</h2>
      <div class="divide-y divide-border">
        <div v-for="cmd in [
          { cmd: '/transaksi', desc: 'Catat transaksi baru (pilih tipe, dompet, kategori, nominal, catatan)' },
          { cmd: '/export', desc: 'Export transaksi ke Excel (pilih periode)' },
          { cmd: '/link <KODE>', desc: 'Hubungkan akun dengan kode dari halaman ini' },
          { cmd: '/status', desc: 'Cek status koneksi akun' },
          { cmd: '/unlink', desc: 'Putus koneksi akun' },
          { cmd: '/batal', desc: 'Batalkan proses yang sedang berjalan' },
          { cmd: '/help', desc: 'Tampilkan bantuan' },
        ]" :key="cmd.cmd" class="flex items-start gap-3 py-2.5">
          <Send :size="15" class="mt-0.5 shrink-0 text-primary" />
          <div>
            <code class="text-xs font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">{{ cmd.cmd }}</code>
            <p class="text-xs text-muted-foreground mt-1">{{ cmd.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaksi Cepat -->
    <div class="bg-card rounded-2xl p-5 border border-border">
      <h2 class="font-semibold text-foreground mb-3">Transaksi Cepat (Satu Baris)</h2>
      <p class="text-xs text-muted-foreground mb-4">
        Tulis transaksi langsung dalam satu baris tanpa percakapan, format:
        <code class="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">&lt;tipe&gt;_&lt;kategori&gt;_&lt;dompet&gt;_&lt;nominal&gt;_&lt;catatan&gt;</code>
      </p>
      <div class="space-y-2">
        <div class="rounded-xl bg-muted/50 border border-border px-4 py-3">
          <code class="text-xs font-mono text-foreground">pengeluaran_makan_cash_50000</code>
          <p class="text-xs text-muted-foreground mt-1">Pengeluaran 50.000 dari dompet Cash, kategori Makan.</p>
        </div>
        <div class="rounded-xl bg-muted/50 border border-border px-4 py-3">
          <code class="text-xs font-mono text-foreground">pemasukan_gaji_bank_1500000_bonus</code>
          <p class="text-xs text-muted-foreground mt-1">Pemasukan 1.500.000 ke dompet Bank, kategori Gaji, catatan "bonus".</p>
        </div>
      </div>
      <ul class="mt-4 space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
        <li>Tipe: <code class="bg-muted px-1 py-0.5 rounded font-mono">pengeluaran</code> atau <code class="bg-muted px-1 py-0.5 rounded font-mono">pemasukan</code></li>
        <li>Nama kategori &amp; dompet harus sesuai dengan data akun (tidak peduli huruf besar/kecil)</li>
        <li>Nominal harus angka bulat positif</li>
      </ul>
    </div>

    <!-- Catatan -->
    <div class="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/40 rounded-xl p-4 border border-border">
      <Info :size="15" class="mt-0.5 shrink-0" />
      <p>
        Bot aktif hanya jika <code class="bg-muted px-1.5 py-0.5 rounded font-mono">TELEGRAM_BOT_TOKEN</code>
        diisi pada konfigurasi backend.
      </p>
    </div>
  </div>
</template>
