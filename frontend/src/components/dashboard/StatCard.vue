<script setup>
import { ArrowLeftRight, TrendingUp, TrendingDown } from '@lucide/vue';

const props = defineProps({
  label: String,
  value: String,
  sub: String,
  color: { type: String, default: 'blue' },
  trend: String,
});

const cfg = {
  blue: { bg: 'bg-blue-600', icon: ArrowLeftRight },
  green: { bg: 'bg-emerald-500', icon: TrendingUp },
  red: { bg: 'bg-rose-500', icon: TrendingDown },
};
</script>

<template>
  <div :class="[cfg[color].bg, 'rounded-2xl p-5 flex flex-col gap-3 shadow-sm']">
    <div class="flex items-center justify-between">
      <span class="text-white/70 text-sm font-medium">{{ label }}</span>
      <span class="bg-white/15 rounded-lg p-1.5">
        <component :is="cfg[color].icon" :size="18" class="text-white/80" />
      </span>
    </div>
    <div>
      <p class="text-white text-2xl font-bold tracking-tight font-mono">{{ value }}</p>
      <p class="text-white/60 text-xs mt-0.5">{{ sub }}</p>
    </div>
  </div>
</template>
