<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterView } from 'vue-router';
import {
  LayoutDashboard, ArrowLeftRight, Wallet, Tag, Target, MessageCircle,
  LogOut, Bell, Menu, X,
} from '@lucide/vue';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const router = useRouter();
const { user, logout } = useAuth();

const sidebarOpen = ref(false);

// Load sidebar state from localStorage
onMounted(() => {
  const saved = localStorage.getItem('sidebarOpen');
  if (saved !== null) {
    sidebarOpen.value = saved === 'true';
  }
});

// Save sidebar state to localStorage whenever it changes
function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
  localStorage.setItem('sidebarOpen', sidebarOpen.value.toString());
}

const NAV_ITEMS = [
  { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { name: 'transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { name: 'wallets', label: 'Dompet', icon: Wallet },
  { name: 'categories', label: 'Kategori', icon: Tag },
  { name: 'budget', label: 'Anggaran', icon: Target },
  // { name: 'wa-bot', label: 'Bot WA', icon: MessageCircle },
  { name: 'telegram-bot', label: 'Bot Telegram', icon: MessageCircle },
];

const currentPage = computed(() => {
  const r = route.name;
  return NAV_ITEMS.find(n => n.name === r)?.label || '';
});

const userInitials = computed(() => {
  if (!user.value?.name) return '??';
  return user.value.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
});

function navigate(name) {
  router.push({ name });
  // Close sidebar on mobile after navigation
  if (window.innerWidth < 768) {
    sidebarOpen.value = false;
    localStorage.setItem('sidebarOpen', 'false');
  }
}

function handleLogout() {
  logout();
  router.push({ name: 'login' });
}

</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden font-sans">
    <!-- Overlay backdrop (only mobile) -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/40 z-30 lg:hidden" @click="toggleSidebar" />

    <!-- Sidebar - Always fixed position, slides in/out -->
    <aside 
      class="fixed inset-y-0 left-0 z-40 flex flex-col bg-sidebar-bg transition-transform duration-300 w-60"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'">

      <div class="px-5 py-5 border-b border-sidebar-border">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <component :is="LayoutDashboard" class="text-white" :size="16" />
          </div>
          <div>
            <p class="text-sm font-bold text-sidebar-fg leading-tight">MoneySecurity</p>
            <p class="text-xs text-sidebar-fg/50">Manajemen Keuangan</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <p class="text-xs font-semibold text-sidebar-fg/40 uppercase tracking-widest px-3 mb-2">Menu</p>
        <button v-for="item in NAV_ITEMS" :key="item.name" @click="navigate(item.name)"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
          :class="route.name === item.name
            ? 'bg-sidebar-accent text-sidebar-accent-fg'
            : 'text-sidebar-fg/60 hover:text-sidebar-fg hover:bg-sidebar-accent/50'">
          <component :is="item.icon" :size="18"
            :class="route.name === item.name ? 'text-blue-400' : ''" />
          <span class="whitespace-nowrap">{{ item.label }}</span>
        </button>
      </nav>

      <div class="px-3 pb-4 border-t border-sidebar-border pt-3">
        <div class="flex items-center gap-3 px-3 py-2.5">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-sidebar-fg truncate">{{ user?.name || 'User' }}</p>
            <p class="text-xs text-sidebar-fg/40 truncate">{{ user?.whatsapp_number || '' }}</p>
          </div>
          <button @click="handleLogout" title="Keluar"
            class="p-1 rounded-lg hover:bg-sidebar-accent text-sidebar-fg/40 hover:text-sidebar-fg transition-colors">
            <LogOut :size="14" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content - Expands full width when sidebar closed -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300"
         :class="sidebarOpen ? 'lg:ml-60' : 'ml-0'">
      <header class="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
        <button @click="toggleSidebar" title="Toggle Menu"
          class="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Menu v-if="!sidebarOpen" :size="18" />
          <X v-else :size="18" />
        </button>
        <div class="flex-1">
          <p class="text-xs text-muted-foreground font-medium">{{ currentPage }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
            <Bell :size="17" />
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {{ userInitials }}
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
        <RouterView v-slot="{ Component }">
          <component :is="Component" :key="$route.fullPath" />
        </RouterView>
      </main>
    </div>
  </div>
</template>
