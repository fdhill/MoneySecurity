<script setup>
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { authService } from '@/services/authService';
import { translateApiMessage } from '@/utils/apiMessages';
import { Banknote, Eye, EyeOff, ArrowLeft, CheckCircle } from '@lucide/vue';

const router = useRouter();
const { login } = useAuth();

const step = ref(1);
const name = ref('');
const email = ref('');
const password = ref('');
const phoneNumber = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');

const otpInputs = ref(['', '', '', '', '', '']);
const otpRefs = ref([]);
const cooldown = ref(0);
let cooldownTimer = null;

function focusOtp(index) {
  otpRefs.value[index]?.focus();
}

function handleOtpInput(index) {
  const val = otpInputs.value[index];
  if (val.length === 1 && index < 5) {
    focusOtp(index + 1);
  }
}

function handleOtpKeydown(index, e) {
  if (e.key === 'Backspace' && !otpInputs.value[index] && index > 0) {
    focusOtp(index - 1);
  }
}

function handleOtpPaste(e) {
  e.preventDefault();
  const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
  for (let i = 0; i < pasted.length; i++) {
    otpInputs.value[i] = pasted[i];
  }
  if (pasted.length > 0) focusOtp(Math.min(pasted.length, 5));
}

function startCooldown() {
  cooldown.value = 60;
  cooldownTimer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

async function handleRequestOtp() {
  error.value = '';
  if (!name.value || !email.value || !password.value) {
    error.value = 'Nama, email, dan password harus diisi';
    return;
  }
  loading.value = true;
  try {
    await authService.requestOtp(email.value);
    step.value = 2;
    startCooldown();
  } catch (e) {
    error.value = translateApiMessage(e.response?.data?.message) || e.message || 'Gagal mengirim OTP';
  } finally {
    loading.value = false;
  }
}

async function handleVerifyOtp() {
  error.value = '';
  const code = otpInputs.value.join('');
  if (code.length !== 6) {
    error.value = 'Kode OTP harus 6 digit';
    return;
  }
  loading.value = true;
  try {
    const res = await authService.verifyOtp({
      email: email.value,
      code,
      name: name.value,
      password: password.value,
      phone_number: phoneNumber.value || undefined,
    });
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    router.push('/');
  } catch (e) {
    error.value = translateApiMessage(e.response?.data?.message) || e.message || 'Verifikasi gagal';
  } finally {
    loading.value = false;
  }
}

async function handleResendOtp() {
  if (cooldown.value > 0) return;
  error.value = '';
  loading.value = true;
  try {
    await authService.requestOtp(email.value);
    otpInputs.value = ['', '', '', '', '', ''];
    startCooldown();
  } catch (e) {
    error.value = translateApiMessage(e.response?.data?.message) || e.message || 'Gagal mengirim ulang OTP';
  } finally {
    loading.value = false;
  }
}

function goBack() {
  step.value = 1;
  error.value = '';
  otpInputs.value = ['', '', '', '', '', ''];
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-sm">
      <div class="bg-card rounded-2xl border border-border shadow-sm p-8">
        <div class="flex flex-col items-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Banknote class="text-white" :size="28" />
          </div>
          <h1 class="text-xl font-bold text-foreground">MoneySecurity</h1>
          <p class="text-sm text-muted-foreground mt-1">
            {{ step === 1 ? 'Buat akun baru' : 'Masukkan kode verifikasi' }}
          </p>
        </div>

        <div v-if="error" class="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {{ error }}
        </div>

        <!-- Step 1: Form Data -->
        <form v-if="step === 1" @submit.prevent="handleRequestOtp" class="flex flex-col gap-4">
          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nama</label>
            <input v-model="name" type="text" placeholder="Nama lengkap"
              class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
            <input v-model="email" type="email" placeholder="email@contoh.com"
              class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Minimal 8 karakter"
                class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nomor Telepon <span class="text-muted-foreground/50">(opsional)</span></label>
            <input v-model="phoneNumber" type="text" placeholder="08xxxxxxxxxx"
              class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
            {{ loading ? 'Mengirim...' : 'Kirim OTP' }}
          </button>
        </form>

        <!-- Step 2: OTP Input -->
        <div v-else class="flex flex-col gap-4">
          <p class="text-sm text-center text-muted-foreground">
            Kode verifikasi dikirim ke<br>
            <span class="font-semibold text-foreground">{{ email }}</span>
          </p>

          <div class="flex justify-center gap-2">
            <input
              v-for="(_, i) in 6" :key="i"
              :ref="el => { if (el) otpRefs[i] = el }"
              v-model="otpInputs[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="w-11 h-12 text-center text-lg font-bold rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              @input="handleOtpInput(i)"
              @keydown="handleOtpKeydown(i, $event)"
              @paste="handleOtpPaste"
            />
          </div>

          <button @click="handleVerifyOtp" :disabled="loading"
            class="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {{ loading ? 'Memverifikasi...' : 'Verifikasi' }}
          </button>

          <button @click="handleResendOtp" :disabled="cooldown > 0 || loading"
            class="w-full py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {{ cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang OTP' }}
          </button>

          <button @click="goBack"
            class="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft :size="14" />
            Ganti email
          </button>
        </div>

        <p class="text-sm text-center mt-6">
          <router-link to="/login" class="text-muted-foreground hover:text-foreground transition-colors">
            Sudah punya akun? <span class="font-semibold text-foreground">Masuk</span>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
