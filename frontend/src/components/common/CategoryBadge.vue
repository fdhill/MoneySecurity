<script setup>
import { computed } from 'vue';
import { Briefcase, Utensils, Car, Music, ShoppingBag, GraduationCap, Heart, Home, Zap, Coffee } from '@lucide/vue';

const props = defineProps({ category: Object });

const ICON_MAP = { utensils: Utensils, car: Car, briefcase: Briefcase, music: Music, shopping: ShoppingBag, graduation: GraduationCap, heart: Heart, home: Home, zap: Zap, coffee: Coffee };
const CATEGORY_DEFAULTS = { 'Makanan': { icon: 'utensils', color: '#f59e0b' }, 'Transportasi': { icon: 'car', color: '#3b82f6' }, 'Gaji': { icon: 'briefcase', color: '#10b981' }, 'Hiburan': { icon: 'music', color: '#8b5cf6' }, 'Belanja': { icon: 'shopping', color: '#ec4899' }, 'Pendidikan': { icon: 'graduation', color: '#0ea5e9' }, 'Kesehatan': { icon: 'heart', color: '#ef4444' }, 'Utilitas': { icon: 'zap', color: '#f97316' }, 'Kopi & Cafe': { icon: 'coffee', color: '#92400e' }, 'Sewa': { icon: 'home', color: '#6366f1' } };

const color = computed(() => props.category?._color || CATEGORY_DEFAULTS[props.category?.name]?.color || '#6b7a99');
const iconName = computed(() => props.category?._iconName || CATEGORY_DEFAULTS[props.category?.name]?.icon || 'briefcase');
const icon = computed(() => ICON_MAP[iconName.value] || Briefcase);
</script>

<template>
  <span v-if="category" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
    :style="{ backgroundColor: color + '18', color }">
    <component :is="icon" :size="14" />
    {{ category.name }}
  </span>
  <span v-else class="text-muted-foreground text-xs">&mdash;</span>
</template>
