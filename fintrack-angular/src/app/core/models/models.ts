// ─── Auth ───────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  currency?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  currency: string;
  theme: string;
  expiresAt: string;
}

export interface CurrentUser {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  currency: string;
  theme: string;
  occupation?: string;
  createdAt: string;
}

// ─── Category ───────────────────────────────
export interface Category {
  id: number;
  name: string;
  type: 'Income' | 'Expense';
  icon?: string;
  color?: string;
  isDefault: boolean;
}

export interface CategoryRequest {
  name: string;
  type: 'Income' | 'Expense';
  icon?: string;
  color?: string;
}

// ─── Transaction ────────────────────────────
export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  date: string;
  notes?: string;
  categoryId: number;
  createdAt: string;
  category: { id: number; name: string; icon?: string; color?: string };
}

export interface TransactionRequest {
  categoryId: number;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  date: string;
  notes?: string;
}

export interface TransactionListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Transaction[];
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  type?: string;
  categoryId?: number;
  search?: string;
  month?: string;
}

// ─── Budget ─────────────────────────────────
export interface Budget {
  id: number;
  amount: number;
  period: string;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'ok' | 'warning' | 'exceeded';
  category: { id: number; name: string; icon?: string; color?: string };
}

export interface BudgetRequest {
  categoryId: number;
  amount: number;
  period?: string;
  month?: number;
  year?: number;
}

export interface BudgetOverview {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  percentUsed: number;
  budgetCount: number;
}

// ─── Savings Goals ───────────────────────────
export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  status: 'Active' | 'Completed' | 'Paused';
  icon?: string;
  color?: string;
  createdAt: string;
  progressPercent: number;
  remaining: number;
}

export interface SavingsGoalRequest {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  targetDate?: string;
  status?: string;
  icon?: string;
  color?: string;
}

// ─── Investment ─────────────────────────────
export interface Investment {
  id: number;
  name: string;
  type: string;
  amountInvested: number;
  currentValue: number;
  gainLoss: number;
  returnPercent: number;
  units?: number;
  purchasePrice?: number;
  currentPrice?: number;
  purchaseDate?: string;
  notes?: string;
}


export interface InvestmentPortfolio {
  investments: Investment[];
  totalInvested: number;
  totalValue: number;
  totalGain: number;
}

export interface InvestmentRequest {
  name: string;
  ticker: string;
  assetType: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  purchaseDate: string;
  dividendEarned?: number;
}

// ─── Debt ───────────────────────────────────
export interface Debt {
  id: number;
  name: string;
  type: string;
  originalAmount: number;
  balance: number;
  interestRate: number;
  minimumPayment?: number;
  dueDate?: number;
  lender?: string;
  status: string;
  notes?: string;
}

export interface DebtListResponse {
  debts: Debt[];
  totalDebt: number;
}

export interface DebtListResponse {
  items: Debt[];
  summary: { totalDebt: number; totalMonthlyPayment: number; debtCount: number };
}

export interface DebtRequest {
  name: string;
  debtType: string;
  originalAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  expectedPayoffDate?: string;
  priority: string;
}

// ─── Notification ────────────────────────────
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'Alert' | 'Reminder' | 'Insight';
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
}

// ─── Dashboard ──────────────────────────────
export interface DashboardData {
  stats: {
    income: number;
    expense: number;
    netBalance: number;
    netWorth: number;
    savingsRate: number;
    incomeDelta: number;
    expenseDelta: number;
  };
  recentTransactions: Transaction[];
  savingsGoals: SavingsGoal[];
  budgetAlerts: {
    categoryName: string;
    budgeted: number;
    spent: number;
    percentUsed: number;
    status: string;
  }[];
  unreadNotifications: number;
}

// ─── Reports ────────────────────────────────
export interface MonthlyReport {
  month: number;
  label: string;
  income: number;
  expense: number;
  net: number;
  savings: number;
}

export interface CategoryReport {
  categoryId: number;
  categoryName: string;
  color?: string;
  icon?: string;
  total: number;
  count: number;
  percentage: number;
}

export interface NetWorthReport {
  totalSavings: number;
  totalInvestments: number;
  totalDebt: number;
  netWorth: number;
  assets: number;
  liabilities: number;
}

// ─── Settings ───────────────────────────────
export interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  occupation?: string;
  dateOfBirth?: string;
  currency: string;
  theme: string;
  createdAt: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  occupation?: string;
  dateOfBirth?: string;
}

export interface PreferencesUpdateRequest {
  currency: string;
  theme: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}