import { expenseRepository, ExpenseFilter, CreateExpenseInput } from '../repository/expenseRepository';

export interface ExpenseResponse {
  id: string;
  amount: number; // in rupees for API response
  amountPaise: number; // in paise for reference
  category: string;
  description: string;
  date: string; // ISO string
  createdAt: string;
}

export interface CategorySummary {
  category: string;
  total: number; // in rupees
  totalPaise: number;
  count: number;
}

export class ExpenseService {
  /**
   * Creates a new expense
   */
  async createExpense(input: {
    amount: number; // in paise
    category: string;
    description: string;
    date: string;
  }): Promise<ExpenseResponse> {
    const expense = await expenseRepository.create({
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: new Date(input.date),
    });

    return this.formatExpenseResponse(expense);
  }

  /**
   * Gets all expenses with filtering and sorting
   */
  async getExpenses(filter?: ExpenseFilter): Promise<ExpenseResponse[]> {
    const expenses = await expenseRepository.findAll(filter);
    return expenses.map((exp) => this.formatExpenseResponse(exp));
  }

  /**
   * Gets expense summary grouped by category
   */
  async getExpenseSummary(): Promise<CategorySummary[]> {
    const grouped = await expenseRepository.getExpensesByCategory();

    return Object.entries(grouped).map(([category, expenses]) => {
      const totalPaise = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        category,
        total: totalPaise / 100,
        totalPaise,
        count: expenses.length,
      };
    });
  }

  /**
   * Calculates total of visible expenses
   */
  async calculateTotal(expenses: ExpenseResponse[]): Promise<number> {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }

  /**
   * Formats expense for API response
   */
  private formatExpenseResponse(expense: any): ExpenseResponse {
    return {
      id: expense.id,
      amount: expense.amount / 100, // Convert paise to rupees
      amountPaise: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    };
  }
}

export const expenseService = new ExpenseService();
