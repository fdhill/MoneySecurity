import { ref, computed } from 'vue';
import { authService } from '@/services/authService';

const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
const token = ref(localStorage.getItem('token') || '');

const isAuthenticated = computed(() => !!token.value);

async function login(email, password) {
  const res = await authService.login(email, password);
  token.value = res.data.token;
  user.value = res.data.user;
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res;
}

function logout() {
  token.value = '';
  user.value = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function fetchProfile() {
  const res = await authService.me();
  user.value = res.data;
  localStorage.setItem('user', JSON.stringify(res.data));
  return res.data;
}

export function useAuth() {
  return { user, token, isAuthenticated, login, logout, fetchProfile };
}
