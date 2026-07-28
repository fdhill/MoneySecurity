const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MoneySecurity API',
      version: '1.0.0',
      description: 'API documentation for MoneySecurity expense tracker',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            whatsapp_number: { type: 'string', example: '6281234567890' },
            role: { type: 'integer', example: 2, description: '1 = admin, 2 = user' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Food' },
            type: { type: 'string', enum: ['expense', 'income'], example: 'expense' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Cash' },
            balance: { type: 'number', example: 500000 },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            wallet_id: { type: 'integer', example: 1 },
            wallet_name: { type: 'string', example: 'Cash' },
            category_id: { type: 'integer', example: 1 },
            category_name: { type: 'string', example: 'Food' },
            amount: { type: 'number', example: 50000 },
            type: { type: 'string', enum: ['expense', 'income'], example: 'expense' },
            description: { type: 'string', example: 'Lunch' },
            transaction_date: { type: 'string', format: 'date', example: '2026-07-28' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            data: { type: 'object', nullable: true },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
