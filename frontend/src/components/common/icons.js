import {
  Utensils, Car, Briefcase, Music, ShoppingBag, GraduationCap,
  Heart, Home, Zap, Coffee, Banknote, CreditCard, Smartphone,
} from '@lucide/vue';

export const ICON_MAP = {
  utensils: Utensils,
  car: Car,
  briefcase: Briefcase,
  music: Music,
  shopping: ShoppingBag,
  graduation: GraduationCap,
  heart: Heart,
  home: Home,
  zap: Zap,
  coffee: Coffee,
};

export const WALLET_ICON_MAP = {
  banknote: Banknote,
  card: CreditCard,
  smartphone: Smartphone,
};

export const WALLET_ICON_LABELS = {
  banknote: 'Tunai',
  card: 'Kartu Bank',
  smartphone: 'E-Wallet',
};

export const CATEGORY_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
  '#0ea5e9', '#ef4444', '#f97316', '#92400e', '#6366f1',
];

export const CATEGORY_ICONS = [
  'utensils', 'car', 'briefcase', 'music', 'shopping',
  'graduation', 'heart', 'zap', 'coffee', 'home',
];

export const WALLET_COLORS = [
  '#10b981', '#2563eb', '#00aed6', '#ee4d2d', '#8b5cf6',
  '#f59e0b', '#ec4899', '#0f172a', '#6366f1', '#f97316',
];

export function formatIDR(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(n);
}

export function formatShort(n) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n}`;
}
