<script setup>
import { ref } from 'vue'
import { MessageCircle, Send, Check, CheckCircle2, AlertCircle, Clock } from '@lucide/vue'

const botActive = ref(true)
const nomorWa = ref('')
const waktuPengingat = ref('20:00')
const notifTypes = ref([
  { key: 'harian', label: 'Pengingat Harian', active: true },
  { key: 'transaksi', label: 'Transaksi Baru', active: true },
  { key: 'laporan', label: 'Laporan Mingguan', active: false },
  { key: 'saldo', label: 'Peringatan Saldo Rendah', active: true },
])
const testLoading = ref(false)

const logEntries = ref([
  { time: '20:00', msg: 'Pengingat harian terkirim', status: 'ok' },
  { time: 'Kemarin 20:00', msg: 'Pengingat harian terkirim', status: 'ok' },
  { time: '21 Jul 20:00', msg: 'Pengingat harian terkirim', status: 'ok' },
  { time: '20 Jul 20:01', msg: 'Gagal kirim: nomor tidak aktif', status: 'err' },
  { time: '19 Jul 20:00', msg: 'Pengingat harian terkirim', status: 'ok' },
])

function toggleNotifType(key) {
  const t = notifTypes.value.find(n => n.key === key)
  if (t) t.active = !t.active
}

function testSend() {
  testLoading.value = true
  setTimeout(() => {
    logEntries.value.unshift({ time: 'Baru saja', msg: 'Uji notifikasi terkirim', status: 'ok' })
    testLoading.value = false
  }, 1500)
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 pb-12">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">Bot WhatsApp</h1>
      <p class="text-sm text-muted-foreground mt-1">Pengingat & notifikasi otomatis via WhatsApp</p>
    </div>

    <!-- Status Card -->
    <div
      class="rounded-2xl p-5 border border-border transition-colors duration-300"
      :class="botActive ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-rose-50 dark:bg-rose-950/30'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300"
            :class="botActive ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-rose-100 dark:bg-rose-900/50'"
          >
            <MessageCircle
              class="w-6 h-6 transition-colors duration-300"
              :class="botActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'"
            />
          </div>
          <div>
            <p
              class="font-semibold transition-colors duration-300"
              :class="botActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'"
            >
              {{ botActive ? 'Aktif & Berjalan' : 'Nonaktif' }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ botActive ? 'Mengirim notifikasi sesuai jadwal' : 'Bot dalam keadaan nonaktif' }}
            </p>
          </div>
        </div>

        <!-- Toggle Switch -->
        <button
          @click="botActive = !botActive"
          class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="[
            botActive ? 'bg-emerald-500 focus:ring-emerald-400' : 'bg-muted focus:ring-rose-400',
          ]"
          role="switch"
          :aria-checked="botActive"
        >
          <span
            class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300"
            :class="botActive ? 'translate-x-7' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Configuration Card -->
    <div class="bg-card rounded-2xl p-5 border border-border space-y-5">
      <h2 class="font-semibold text-foreground">Konfigurasi</h2>

      <!-- Nomor WhatsApp -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground" for="nomor-wa">Nomor WhatsApp</label>
        <input
          id="nomor-wa"
          v-model="nomorWa"
          type="tel"
          placeholder="628xxxxxxxxxx"
          class="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
        />
      </div>

      <!-- Waktu Pengingat -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground flex items-center gap-2" for="waktu-pengingat">
          <Clock class="w-4 h-4 text-muted-foreground" />
          Waktu Pengingat Harian
        </label>
        <input
          id="waktu-pengingat"
          v-model="waktuPengingat"
          type="time"
          class="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
        />
      </div>

      <!-- Jenis Notifikasi -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Jenis Notifikasi Aktif</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="n in notifTypes"
            :key="n.key"
            @click="toggleNotifType(n.key)"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
            :class="n.active
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted text-muted-foreground border-border hover:border-primary/40'"
          >
            <Check v-if="n.active" class="w-3 h-3" />
            {{ n.label }}
          </button>
        </div>
      </div>

      <!-- Test Button -->
      <button
        @click="testSend"
        :disabled="testLoading"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:scale-[0.97] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send class="w-4 h-4" :class="testLoading ? 'animate-pulse' : ''" />
        {{ testLoading ? 'Mengirim...' : 'Uji Kirim Notifikasi' }}
      </button>
    </div>

    <!-- Notification Log -->
    <div class="bg-card rounded-2xl p-5 border border-border">
      <h2 class="font-semibold text-foreground mb-4">Log Notifikasi</h2>
      <div class="space-y-3">
        <div
          v-for="(entry, i) in logEntries"
          :key="i"
          class="flex items-start gap-3"
        >
          <CheckCircle2
            v-if="entry.status === 'ok'"
            class="w-4 h-4 mt-0.5 shrink-0 text-emerald-500"
          />
          <AlertCircle
            v-else
            class="w-4 h-4 mt-0.5 shrink-0 text-red-500"
          />
          <div class="min-w-0 flex-1">
            <p
              class="text-sm"
              :class="entry.status === 'ok' ? 'text-foreground' : 'text-red-600 dark:text-red-400'"
            >
              {{ entry.msg }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ entry.time }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
