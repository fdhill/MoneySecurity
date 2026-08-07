import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

import LoginView from '@/views/LoginView.vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import TransactionsView from '@/views/TransactionsView.vue';
import WalletsView from '@/views/WalletsView.vue';
import CategoriesView from '@/views/CategoriesView.vue';
import BudgetView from '@/views/BudgetView.vue';
import WaBotView from '@/views/WaBotView.vue';
import TelegramBotView from '@/views/TelegramBotView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guest: true },
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: DashboardView },
      { path: 'transactions', name: 'transactions', component: TransactionsView },
      { path: 'wallets', name: 'wallets', component: WalletsView },
      { path: 'categories', name: 'categories', component: CategoriesView },
      { path: 'budget', name: 'budget', component: BudgetView },
      { path: 'wa-bot', name: 'wa-bot', component: WaBotView },
      { path: 'telegram-bot', name: 'telegram-bot', component: TelegramBotView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth();
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login' };
  }
  if (to.meta.guest && isAuthenticated.value) {
    return { name: 'dashboard' };
  }
});

export default router;
