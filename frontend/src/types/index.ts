export interface Expense {
  id: string;
  amount: number; // in rupees
  amountPaise: number; // in paise
  category: string;
  description: string;
  date: string; // ISO string
  createdAt: string;
}

export interface CreateExpenseRequest {
  amount: number; // in paise
  category: string;
  description: string;
  date: string; // ISO string
}

export interface ExpenseListResponse {
  success: boolean;
  data: Expense[];
  summary: {
    count: number;
    total: number;
  };
}

export interface CreateExpenseResponse {
  success: boolean;
  data: Expense;
}

export interface CategorySummary {
  category: string;
  total: number; // in rupees
  totalPaise: number;
  count: number;
}

export interface SummaryResponse {
  success: boolean;
  data: CategorySummary[];
}
