const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { fail } = require('./utils/response');
const logger = require('./utils/logger');

require('./jobs/budgetCron');

if (process.env.TELEGRAM_BOT_TOKEN) {
  require('./bots/telegram');
}

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logger.info(
        {
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs: Number(process.hrtime.bigint() - start) / 1e6,
        },
        'request',
      );
    }
  });
  next();
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use((req, res) => {
  fail(res, 'Route not found', 404, null);
});

app.use(errorHandler);

module.exports = app;
