namespace FinTrack.Models.ViewModels
{
    public class ExpenseViewModel
    {
        public List<Transaction> Transactions { get; set; } = new();
        public List<Category> Categories { get; set; } = new();
        public CreateTransactionViewModel NewTransaction { get; set; } = new();

        // Stats
        public decimal TotalExpenses { get; set; }
        public decimal LargestExpense { get; set; }
        public string TopCategory { get; set; } = string.Empty;
        public int TransactionCount { get; set; }

        // Category breakdown
        public List<ExpenseCategoryBreakdown> CategoryBreakdown { get; set; } = new();

        // Filters
        public int SelectedMonth { get; set; }
        public int SelectedYear { get; set; }
    }

    public class ExpenseCategoryBreakdown
    {
        public string CategoryName { get; set; } = string.Empty;
        public string Color { get; set; } = "#94a3b8";
        public decimal Amount { get; set; }
        public int Percentage { get; set; }
        public int Count { get; set; }
    }
}