const cron = require('node-cron');
const pool = require('../config/db');

cron.schedule('0 0 1 * *', async () => {
  console.log('[Cron] Generating budget instances...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: templates } = await client.query(
      'SELECT * FROM budget_templates WHERE is_recurring = true',
    );

    const now = new Date();
    const period_start = new Date(now.getFullYear(), now.getMonth(), 1);
    const period_end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startStr = period_start.toISOString().split('T')[0];
    const endStr = period_end.toISOString().split('T')[0];

    for (const template of templates) {
      const { rows: existing } = await client.query(
        'SELECT id FROM budget_instances WHERE template_id = $1 AND period_start = $2',
        [template.id, startStr],
      );

      if (existing.length === 0) {
        await client.query(
          'INSERT INTO budget_instances (template_id, period_start, period_end) VALUES ($1, $2, $3)',
          [template.id, startStr, endStr],
        );
        console.log(`[Cron] Instance created for template ${template.id}`);
      }
    }

    await client.query('COMMIT');
    console.log('[Cron] Done generating budget instances');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Cron] Error:', err);
  } finally {
    client.release();
  }
});
