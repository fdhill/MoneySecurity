<script setup>
import { ref, onMounted } from 'vue';

const apiStatus = ref('checking...');

onMounted(async () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    apiStatus.value = data.status === 'ok' ? 'connected' : 'error';
  } catch {
    apiStatus.value = 'unreachable';
  }
});
</script>

<template>
  <main>
    <p>Backend API status: {{ apiStatus }}</p>
  </main>
</template>
