import { Request, Response } from 'express';
import { expenseService } from '../services/expenseService';
import { validateExpense, ValidationError } from '../utils/validation';
import { IdempotentRequest } from '../middleware/idempotency';

export class ExpenseController {
  /**
   * POST /expenses
   * Creates a new expense
   */
  async createExpense(req: IdempotentRequest, res: Response): Promise<void> {
    try {
      // Validate input
      const validationErrors = validateExpense(req.body);
      if (validationErrors.length > 0) {
        res.status(400).json({
          error: 'Validation failed',
          details: validationErrors,
        });
        return;
      }

      // Ensure amount is an integer (paise)
      const amount = Math.round(req.body.amount);
      if (amount <= 0) {
        res.status(400).json({
          error: 'Validation failed',
          details: [{ field: 'amount', message: 'Amount must be greater than 0' }],
        });
        return;
      }

      // Create expense
      const expense = await expenseService.createExpense({
        amount,
        category: req.body.category,
        description: req.body.description || '',
        date: req.body.date,
      });

      res.status(201).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({
        error: 'Failed to create expense',
      });
    }
  }

  /**
   * GET /expenses
   * Retrieves expenses with optional filtering and sorting
   */
  async getExpenses(req: Request, res: Response): Promise<void> {
    try {
      const { category, sort } = req.query;

      const filter = {
        category: category as string | undefined,
        sortBy: (sort || 'date_desc') as 'date_desc' | 'date_asc',
      };

      const expenses = await expenseService.getExpenses(filter);
      const total = await expenseService.calculateTotal(expenses);

      res.status(200).json({
        success: true,
        data: expenses,
        summary: {
          count: expenses.length,
          total: total,
        },
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({
        error: 'Failed to fetch expenses',
      });
    }
  }

  /**
   * GET /expenses/summary
   * Retrieves expense summary grouped by category
   */
  async getExpenseSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await expenseService.getExpenseSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({
        error: 'Failed to fetch summary',
      });
    }
  }
}

export const expenseController = new ExpenseController();
