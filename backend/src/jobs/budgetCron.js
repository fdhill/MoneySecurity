const cron = require('node-cron');
const pool = require('../config/db');
const logger = require('../utils/logger');

cron.schedule('0 0 1 * *', async () => {
  logger.info('Generating budget instances...');

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
        logger.info({ templateId: template.id }, 'budget instance created');
      }
    }

    await client.query('COMMIT');
    logger.info('Done generating budget instances');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error({ err }, 'budget cron failed');
  } finally {
    client.release();
  }
});
