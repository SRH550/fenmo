import React, { useState, useEffect } from 'react';
import { useExpenses, fetchCategories } from '../hooks/useExpenses';
import '../styles/ExpenseControls.css';

interface ExpenseControlsProps {
  onFilterChange: (category?: string, sort?: 'date_desc' | 'date_asc') => void;
  refreshTrigger?: number; // Triggers category refresh when expenses are added
}

export const ExpenseControls: React.FC<ExpenseControlsProps> = ({ onFilterChange, refreshTrigger = 0 }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]); // Reload categories when refreshTrigger changes

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    onFilterChange(category || undefined, sortOrder);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value as 'date_desc' | 'date_asc';
    setSortOrder(sort);
    onFilterChange(selectedCategory || undefined, sort);
  };

  const handleClearFilter = () => {
    setSelectedCategory('');
    onFilterChange(undefined, sortOrder);
  };

  return (
    <div className="expense-controls">
      <div className="control-group">
        <label htmlFor="category-filter">Filter by Category</label>
        <div className="filter-container">
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={loadingCategories || categories.length === 0}
          >
            <option value="">All Categories ({loadingCategories ? 'Loading...' : categories.length})</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <button
              className="clear-filter-btn"
              onClick={handleClearFilter}
              title="Clear category filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="sort-order">Sort by Date</label>
        <select id="sort-order" value={sortOrder} onChange={handleSortChange}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
};
