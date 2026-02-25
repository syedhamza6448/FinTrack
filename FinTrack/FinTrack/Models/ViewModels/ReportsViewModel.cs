namespace FinTrack.Models.ViewModels
{
    public class ReportsViewModel
    {
        public int SelectedMonth { get; set; }
        public int SelectedYear { get; set; }

        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetSavings => TotalIncome - TotalExpenses;
        public decimal SavingsRate => TotalIncome > 0
            ? Math.Round((NetSavings / TotalIncome) * 100, 1)
            : 0;

        public List<CategorySpending> SpendingByCategory { get; set; } = new();

        public List<MonthlyTrend> MonthlyTrends { get; set; } = new();

        public List<Transaction> TopExpenses { get; set; } = new();

        public List<BudgetPerfomance> BudgetPerformances { get; set; } = new();
    }

    public class CategorySpending
    {
        public string CategoryName { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal Amount {  get; set; }
        public decimal Percentage { get; set; }
    }

    public class MonthlyTrend
    {
        public string MonthLabel { get; set; } = string.Empty;
        public decimal Income { get; set; }
        public decimal Expenses { get; set; }
        public decimal Net => Income - Expenses;
    }

    public class BudgetPerfomance
    {
        public string CategoryName { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal Budgeted { get; set; }
        public decimal Spent { get; set; }
        public int PercentUsed => Budgeted > 0
            ? (int)Math.Min((Spent / Budgeted) * 100, 100)
            : 0;
        public bool IsOverBudget => Spent > Budgeted;
    }
}


