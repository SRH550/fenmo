import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Expense,
  CreateExpenseRequest,
  ExpenseListResponse,
  CreateExpenseResponse,
  SummaryResponse,
  CategorySummary,
} from '../types';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Hook for creating expenses with idempotency support
 */
export function useCreateExpense() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExpense = useCallback(
    async (expense: CreateExpenseRequest): Promise<Expense | null> => {
      setLoading(true);
      setError(null);

      try {
        const idempotencyKey = uuidv4();

        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify(expense),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create expense');
        }

        const data: CreateExpenseResponse = await response.json();
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createExpense, loading, error };
}

/**
 * Hook for fetching expenses
 */
export function useExpenses(category?: string, sort: 'date_desc' | 'date_asc' = 'date_desc') {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('sort', sort);

      const response = await fetch(`${API_BASE_URL}/expenses?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data: ExpenseListResponse = await response.json();
      setExpenses(data.data);
      setTotal(data.summary.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  return { expenses, loading, error, total, fetchExpenses };
}

/**
 * Hook for fetching expense summary
 */
export function useExpenseSummary() {
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/summary`);

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data: SummaryResponse = await response.json();
      setSummary(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { summary, loading, error, fetchSummary };
}

/**
 * Helper function to get unique categories
 */
export async function fetchCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/expenses`);
    if (!response.ok) throw new Error('Failed to fetch categories');

    const data: ExpenseListResponse = await response.json();
    const categories = Array.from(
      new Set(data.data.map((expense) => expense.category))
    ).sort();

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
