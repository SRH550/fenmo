import React from 'react';
import { Expense } from '../types';
import '../styles/ExpenseList.css';

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  total: number;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  loading,
  error,
  total,
}) => {
  if (error) {
    return <div className="error-message">Error loading expenses: {error}</div>;
  }

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expense-list">
      <h2>Expenses</h2>

      {expenses.length === 0 ? (
        <p className="empty-message">No expenses found. Add one to get started!</p>
      ) : (
        <>
          <div className="expenses-table-wrapper">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td className="description">{expense.description}</td>
                    <td className="amount">₹{expense.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="expense-total">
            <strong>Total: ₹{total.toFixed(2)}</strong>
          </div>
        </>
      )}
    </div>
  );
};
