import { useEffect, useState } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseControls } from './components/ExpenseControls';
import { useExpenses } from './hooks/useExpenses';
import './App.css';

function App() {
  const [category, setCategory] = useState<string>();
  const [sort, setSort] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Triggers category list refresh
  const { expenses, loading, error, total, fetchExpenses } = useExpenses(category, sort);

  // Load expenses on mount and when filters change
  useEffect(() => {
    fetchExpenses();
  }, [category, sort, fetchExpenses]);

  const handleFilterChange = (newCategory?: string, newSort?: 'date_desc' | 'date_asc') => {
    setCategory(newCategory);
    if (newSort) {
      setSort(newSort);
    }
  };

  const handleExpenseAdded = () => {
    // Refresh both expenses list and category dropdown
    fetchExpenses();
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p>Track your expenses and manage your budget</p>
      </header>

      <main className="app-main">
        <div className="container">
          <ExpenseForm onSuccess={handleExpenseAdded} />

          <ExpenseControls 
            onFilterChange={handleFilterChange} 
            refreshTrigger={refreshTrigger}
          />

          <ExpenseList expenses={expenses} loading={loading} error={error} total={total} />
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Expense Tracker. Built with React + Node.js</p>
      </footer>
    </div>
  );
}

export default App;
