import { reactive } from 'vue';
import { translateApiMessage } from '@/utils/apiMessages';

const toasts = reactive([]);
let sequence = 0;

function dismissToast(id) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) toasts.splice(index, 1);
}

function showToast(message, type = 'success', duration = 3500) {
  const id = ++sequence;
  toasts.push({ id, message: translateApiMessage(message), type });
  if (duration > 0) setTimeout(() => dismissToast(id), duration);
}

export function useToast() {
  return { toasts, showToast, dismissToast };
}
