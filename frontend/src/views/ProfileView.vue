<script setup>
import { ref, computed, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { authService } from '@/services/authService';
import { useToast } from '@/composables/useToast';
import { translateApiMessage } from '@/utils/apiMessages';
import { User, Phone, Lock, Save, Eye, EyeOff } from '@lucide/vue';

const { user, fetchProfile } = useAuth();
const { showToast } = useToast();

const editName = ref('');
const editPhone = ref('');
const editLoading = ref(false);
const editError = ref('');

const oldPassword = ref('');
const newPassword = ref('');
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const passwordLoading = ref(false);
const passwordError = ref('');

watch(user, (u) => {
  if (u) {
    editName.value = u.name || '';
    editPhone.value = u.whatsapp_number || '';
  }
}, { immediate: true });

const initials = computed(() => {
  if (!user.value?.name) return '??';
  return user.value.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
});

async function handleUpdateProfile() {
  editError.value = '';
  if (!editName.value) {
    editError.value = 'Nama harus diisi';
    return;
  }
  editLoading.value = true;
  try {
    await authService.updateProfile({
      name: editName.value,
      whatsapp_number: editPhone.value || undefined,
    });
    await fetchProfile();
    showToast('Profil berhasil diperbarui');
  } catch (e) {
    editError.value = translateApiMessage(e.response?.data?.message) || e.message || 'Gagal memperbarui profil';
  } finally {
    editLoading.value = false;
  }
}

async function handleChangePassword() {
  passwordError.value = '';
  if (!oldPassword.value || !newPassword.value) {
    passwordError.value = 'Password lama dan baru harus diisi';
    return;
  }
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password baru minimal 8 karakter';
    return;
  }
  passwordLoading.value = true;
  try {
    await authService.changePassword({
      old_password: oldPassword.value,
      new_password: newPassword.value,
    });
    oldPassword.value = '';
    newPassword.value = '';
    showToast('Password berhasil diubah');
  } catch (e) {
    passwordError.value = translateApiMessage(e.response?.data?.message) || e.message || 'Gagal mengubah password';
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 pb-12">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Profil Saya</h1>
      <p class="text-sm text-muted-foreground mt-1">Kelola informasi akun Anda</p>
    </div>

    <!-- Info Akun -->
    <div class="bg-card rounded-2xl p-5 border border-border">
      <h2 class="font-semibold text-foreground mb-4">Informasi Akun</h2>
      <div class="flex items-center gap-4 mb-5">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {{ initials }}
        </div>
        <div>
          <p class="font-semibold text-foreground">{{ user.name }}</p>
          <p class="text-sm text-muted-foreground">{{ user.email }}</p>
        </div>
      </div>
      <div class="grid gap-3">
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40">
          <User :size="16" class="text-muted-foreground" />
          <div>
            <p class="text-xs text-muted-foreground">Nama</p>
            <p class="text-sm font-medium text-foreground">{{ user.name }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40">
          <div class="text-muted-foreground text-xs font-bold w-4 text-center">@</div>
          <div>
            <p class="text-xs text-muted-foreground">Email</p>
            <p class="text-sm font-medium text-foreground">{{ user.email }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40">
          <Phone :size="16" class="text-muted-foreground" />
          <div>
            <p class="text-xs text-muted-foreground">Nomor WhatsApp</p>
            <p class="text-sm font-medium text-foreground">{{ user.whatsapp_number || 'Belum diisi' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profil -->
    <div class="bg-card rounded-2xl p-5 border border-border">
      <h2 class="font-semibold text-foreground mb-4">Edit Profil</h2>

      <div v-if="editError" class="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
        {{ editError }}
      </div>

      <form @submit.prevent="handleUpdateProfile" class="flex flex-col gap-4">
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nama</label>
          <input v-model="editName" type="text" placeholder="Nama lengkap"
            class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nomor WhatsApp <span class="text-muted-foreground/50">(opsional)</span></label>
          <input v-model="editPhone" type="text" placeholder="08xxxxxxxxxx"
            class="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button type="submit" :disabled="editLoading"
          class="inline-flex items-center justify-center gap-2 self-start px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
          <Save :size="15" />
          {{ editLoading ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </form>
    </div>

    <!-- Ganti Password -->
    <div class="bg-card rounded-2xl p-5 border border-border">
      <h2 class="font-semibold text-foreground mb-4">Ganti Password</h2>

      <div v-if="passwordError" class="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
        {{ passwordError }}
      </div>

      <form @submit.prevent="handleChangePassword" class="flex flex-col gap-4">
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password Lama</label>
          <div class="relative">
            <input v-model="oldPassword" :type="showOldPassword ? 'text' : 'password'" placeholder="Masukkan password lama"
              class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button type="button" @click="showOldPassword = !showOldPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <EyeOff v-if="showOldPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password Baru</label>
          <div class="relative">
            <input v-model="newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="Minimal 8 karakter"
              class="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button type="button" @click="showNewPassword = !showNewPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <EyeOff v-if="showNewPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>
        <button type="submit" :disabled="passwordLoading"
          class="inline-flex items-center justify-center gap-2 self-start px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
          <Lock :size="15" />
          {{ passwordLoading ? 'Menyimpan...' : 'Ganti Password' }}
        </button>
      </form>
    </div>
  </div>
</template>
