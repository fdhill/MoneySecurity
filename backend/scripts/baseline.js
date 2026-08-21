const autocannon = require('autocannon');

const BASE = 'http://localhost:3000/api';
const token = process.argv[2];
const only = process.argv[3] || null;
const CONNECTIONS = Number(process.argv[4]) || 20;
const DURATION = Number(process.argv[5]) || 30;

if (!token) {
  console.error('usage: node scripts/baseline.js <JWT_TOKEN> [endpoint-substring] [connections] [duration]');
  process.exit(1);
}

const AUTH = `Authorization: Bearer ${token}`;
const CONTENT_JSON = 'Content-Type: application/json';

async function getIds() {
  const headers = { Authorization: `Bearer ${token}` };
  const [walletsRes, categoriesRes] = await Promise.all([
    fetch(`${BASE}/wallets`, { headers }),
    fetch(`${BASE}/categories`, { headers }),
  ]);
  const wallets = (await walletsRes.json()).data;
  const categories = (await categoriesRes.json()).data;
  const wallet = wallets.find((w) => w.name === 'Cash') || wallets[0];
  const category = categories.find((c) => c.type === 'expense') || categories[0];
  const incomeCategory = categories.find((c) => c.type === 'income') || categories[0];
  return { wallet_id: wallet.id, category_id: category.id, income_category_id: incomeCategory.id };
}

async function run(label, opts) {
  if (only && !label.includes(only)) return;
  const headers = { Authorization: `Bearer ${token}` };
  const config = {
    url: `${BASE}${opts.path}`,
    method: opts.method || 'GET',
    headers,
    connections: CONNECTIONS,
    duration: DURATION,
  };
  if (opts.body) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(opts.body);
  }
  const res = await autocannon(config);
  const lat = res.latency;
  console.log(
    [
      label.padEnd(28),
      `${res.requests.total} req`,
      `${Math.round(res.requests.average)} RPS`.padStart(9),
      `p50 ${Math.round(lat.p50)}ms`.padStart(10),
      `p90 ${Math.round(lat.p90)}ms`.padStart(10),
      `p99 ${Math.round(lat.p99)}ms`.padStart(10),
      `err=${res.errors} non2xx=${res.non2xx}`,
    ].join(' | '),
  );
}

async function main() {
  const { wallet_id, category_id, income_category_id } = await getIds();
  console.log(`Baseline: ${CONNECTIONS} koneksi, ${DURATION}s per endpoint, token OK\n`);

  await run('GET /health', { path: '/health' });
  await run('POST /auth/login', {
    path: '/auth/login',
    method: 'POST',
    body: { email: 'perftest@moneysecurity.test', password: 'perftest123' },
  });
  await run('GET /auth/me', { path: '/auth/me' });
  await run('GET /wallets', { path: '/wallets' });
  await run('GET /categories', { path: '/categories' });
  await run('GET /budgets', { path: '/budgets' });
  await run('GET /transactions', { path: '/transactions' });
  await run('POST /transactions', {
    path: '/transactions',
    method: 'POST',
    body: { wallet_id, category_id: income_category_id, amount: 50000, type: 'income', description: 'load test' },
  });
  await run('GET /export', { path: '/export' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
