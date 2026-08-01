<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed top-4 right-4 z-[100] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-card px-4 py-3 shadow-lg"
          :class="t.type === 'error' ? 'border-rose-200' : 'border-emerald-200'"
          role="status"
        >
          <CircleCheck
            v-if="t.type !== 'error'"
            :size="18"
            class="mt-0.5 flex-shrink-0 text-emerald-500"
          />
          <CircleAlert
            v-else
            :size="18"
            class="mt-0.5 flex-shrink-0 text-rose-500"
          />
          <p class="flex-1 text-sm text-foreground leading-snug">{{ t.message }}</p>
          <button
            class="flex-shrink-0 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            @click="dismissToast(t.id)"
          >
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CircleCheck, CircleAlert, X } from '@lucide/vue';
import { useToast } from '@/composables/useToast';

const { toasts, dismissToast } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
