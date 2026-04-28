import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import expensesRouter from './routes/expenses';
import { errorHandler, notFound, requestLogger } from './middleware/errorHandler';
import { idempotencyMiddleware } from './middleware/idempotency';

// Initialize Prisma
export const prisma = new PrismaClient();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);
app.use(idempotencyMiddleware);

// CORS (allow localhost for development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Routes
app.use('/expenses', expensesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✓ Database connected');

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
