<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { Banknote, Eye, EyeOff } from '@lucide/vue';

const router = useRouter();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  error.value = '';
  if (!email.value || !password.value) {
    error.value = 'Email dan password harus diisi';
    return;
  }
  loading.value = true;
  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (e) {
    error.value = e.message || 'Login gagal. Periksa email dan password.';
  } finally {
    loading.value = false;
  }
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
          <p class="text-sm text-muted-foreground mt-1">Masuk ke akun Anda</p>
        </div>

        <div v-if="error" class="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
            <input v-model="email" type="email" placeholder="email@contoh.com"
              class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan password"
                class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <button type="submit" :disabled="loading"
            class="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
            {{ loading ? 'Masuk...' : 'Masuk' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
