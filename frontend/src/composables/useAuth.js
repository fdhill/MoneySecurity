import { ref, computed } from 'vue';
import api from '@/services/api';

const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
const token = ref(localStorage.getItem('token') || '');

const isAuthenticated = computed(() => !!token.value);

async function login(whatsapp_number, password) {
  const res = await api.post('/auth/login', { whatsapp_number, password });
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
  const res = await api.get('/auth/me');
  user.value = res.data;
  localStorage.setItem('user', JSON.stringify(res.data));
  return res.data;
}

export function useAuth() {
  return { user, token, isAuthenticated, login, logout, fetchProfile };
}
