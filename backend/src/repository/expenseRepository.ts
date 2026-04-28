import { prisma } from '../index';

export interface CreateExpenseInput {
  amount: number; // in paise
  category: string;
  description: string;
  date: Date;
}

export interface ExpenseFilter {
  category?: string;
  sortBy?: 'date_desc' | 'date_asc';
}

export class ExpenseRepository {
  /**
   * Creates a new expense
   */
  async create(data: CreateExpenseInput) {
    return prisma.expense.create({
      data: {
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date,
      },
    });
  }

  /**
   * Gets all expenses with optional filtering and sorting
   */
  async findAll(filter?: ExpenseFilter) {
    let orderBy: { [key: string]: string } = { date: 'desc' };

    if (filter?.sortBy === 'date_asc') {
      orderBy = { date: 'asc' };
    } else if (filter?.sortBy === 'date_desc') {
      orderBy = { date: 'desc' };
    }

    const where = filter?.category ? { category: filter.category } : {};

    return prisma.expense.findMany({
      where,
      orderBy,
    });
  }

  /**
   * Gets a single expense by ID
   */
  async findById(id: string) {
    return prisma.expense.findUnique({
      where: { id },
    });
  }

  /**
   * Gets expenses grouped by category for summary
   */
  async getExpensesByCategory() {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    const grouped = expenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = [];
        }
        acc[expense.category].push(expense);
        return acc;
      },
      {} as { [key: string]: typeof expenses }
    );

    return grouped;
  }

  /**
   * Deletes an expense (optional feature)
   */
  async delete(id: string) {
    return prisma.expense.delete({
      where: { id },
    });
  }
}

export const expenseRepository = new ExpenseRepository();
