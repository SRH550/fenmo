import { useState } from 'react';
import { useCreateExpense } from '../hooks/useExpenses';
import { CreateExpenseRequest } from '../types';
import '../styles/ExpenseForm.css';

interface ExpenseFormProps {
  onSuccess: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const { createExpense, loading, error } = useCreateExpense();
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    if (!formData.amount) {
      setValidationError('Amount is required');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError('Amount must be a positive number');
      return;
    }

    if (!formData.category.trim()) {
      setValidationError('Category is required');
      return;
    }

    if (!formData.date) {
      setValidationError('Date is required');
      return;
    }

    // Convert rupees to paise (integer)
    const amountInPaise = Math.round(amount * 100);

    const expense: CreateExpenseRequest = {
      amount: amountInPaise,
      category: formData.category,
      description: formData.description,
      date: new Date(formData.date).toISOString(),
    };

    const result = await createExpense(expense);

    if (result) {
      // Reset form
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      onSuccess();
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Add Expense</h2>

      {(error || validationError) && (
        <div className="error-message">{error || validationError}</div>
      )}

      <div className="form-group">
        <label htmlFor="amount">Amount (₹)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={loading}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter expense description"
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
};
