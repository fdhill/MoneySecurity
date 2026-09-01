const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Security headers
app.use(helmet());

// CORS — restrict to configured origin in production
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin } : {}));

// Rate limiting — global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later' },
});

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

// Apply stricter rate limit to auth routes
app.use('/api/auth', authLimiter);

app.use('/api', routes);

app.use((req, res) => {
  fail(res, 'Route not found', 404, null);
});

app.use(errorHandler);

module.exports = app;
