import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';

const app = createApp(App);
app.use(router);

app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue error]', err, info);
};

window.addEventListener('error', (e) => {
  console.error('[Window error]', e.message, e.filename + ':' + e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled rejection]', e.reason);
});

app.mount('#app');
