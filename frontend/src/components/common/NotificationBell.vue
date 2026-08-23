<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Bell, CheckCheck, Inbox } from '@lucide/vue';
import { activityService } from '@/services/activityService';

const unreadCount = ref(0);
const open = ref(false);
const activities = ref([]);
const loading = ref(false);
const loadedOnce = ref(false);
const rootRef = ref(null);

onMounted(() => {
  fetchUnreadCount();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

async function fetchUnreadCount() {
  try {
    const res = await activityService.getUnreadCount();
    unreadCount.value = res.data.count;
  } catch {
    // biarkan badge terakhir; tidak perlu toast untuk ini
  }
}

function handleClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    open.value = false;
  }
}

function toggle() {
  open.value = !open.value;
  if (open.value && !loadedOnce.value) {
    fetchList();
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await activityService.getActivities({ page: 1, limit: 10 });
    activities.value = res.data.data;
    loadedOnce.value = true;
  } finally {
    loading.value = false;
  }
}

async function markRead(item) {
  await activityService.markRead(item.id);
  activities.value = activities.value.filter((a) => a.id !== item.id);
  if (unreadCount.value > 0) unreadCount.value--;
}

async function markAllRead() {
  await activityService.markAllRead();
  activities.value = [];
  unreadCount.value = 0;
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <button @click="toggle" title="Notifikasi"
      class="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
      <Bell :size="17" />
      <span v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95">
      <div v-if="open"
        class="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <p class="text-sm font-semibold text-foreground">
            Notifikasi
            <span v-if="unreadCount > 0"
              class="ml-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
              {{ unreadCount }} baru
            </span>
          </p>
          <button v-if="activities.length > 0" @click="markAllRead"
            class="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <CheckCheck :size="13" />
            Tandai semua dibaca
          </button>
        </div>

        <div class="max-h-80 overflow-y-auto">
          <p v-if="loading" class="px-4 py-6 text-center text-sm text-muted-foreground">Memuat...</p>

          <p v-else-if="activities.length === 0"
            class="px-4 py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Inbox :size="22" class="opacity-40" />
            Tidak ada notifikasi
          </p>

          <template v-else>
            <button v-for="item in activities" :key="item.id" @click="markRead(item)"
              class="w-full flex flex-col gap-0.5 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted transition-colors text-left">
              <span class="text-sm text-foreground leading-snug">{{ item.description }}</span>
              <span class="text-xs text-muted-foreground">{{ timeAgo(item.created_at) }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>
