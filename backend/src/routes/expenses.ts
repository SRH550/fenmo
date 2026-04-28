import { Router } from 'express';
import { expenseController } from '../controllers/expenseController';

const router = Router();

/**
 * POST /expenses
 * Create a new expense with idempotency support
 */
router.post('/', async (req, res) => {
  await expenseController.createExpense(req, res);
});

/**
 * GET /expenses
 * Get expenses with optional filtering and sorting
 */
router.get('/', async (req, res) => {
  await expenseController.getExpenses(req, res);
});

/**
 * GET /expenses/summary
 * Get expense summary by category
 */
router.get('/summary', async (req, res) => {
  await expenseController.getExpenseSummary(req, res);
});

export default router;
