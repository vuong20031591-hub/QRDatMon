/**
 * Swagger/OpenAPI Configuration
 * Requirements: 28.4
 */

const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QRDatMon API',
      version: '1.0.0',
      description: 'Restaurant Ordering System API Documentation',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errorCode: { type: 'string' }
          }
        },
        MenuItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            image: { type: 'string' },
            status: { type: 'string', enum: ['available', 'out_of_stock', 'hidden'] }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            table: { type: 'string' },
            items: { type: 'array' },
            status: { type: 'string' },
            total: { type: 'number' }
          }
        },
        Bill: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            table: { type: 'string' },
            subtotal: { type: 'number' },
            serviceCharge: { type: 'number' },
            vat: { type: 'number' },
            discount: { type: 'number' },
            total: { type: 'number' },
            status: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Menu', description: 'Menu management' },
      { name: 'Categories', description: 'Category management' },
      { name: 'Tables', description: 'Table management' },
      { name: 'Cart', description: 'Shopping cart' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Bills', description: 'Bill management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Promotions', description: 'Promotions and vouchers' },
      { name: 'Reviews', description: 'Customer reviews' },
      { name: 'Inventory', description: 'Inventory management' },
      { name: 'Staff', description: 'Staff management' },
      { name: 'Reports', description: 'Reports and analytics' },
      { name: 'Upload', description: 'File upload' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
