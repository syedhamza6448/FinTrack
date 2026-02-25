using FinTrack.Models;

namespace FinTrack.Models.ViewModels
{
    public class DashboardViewModel
    {
        public decimal TotalBalance { get; set; }
        public decimal MonthlySpending { get; set; }
        public decimal TotalSavings { get; set; }
        public decimal TotalBudget { get; set; }
        public string UserFirstName { get; set; }

        public List<Transaction> RecentTransactions { get; set; } = new();
        public List<SavingsGoal> SavingsGoals { get; set; } = new();
        public List<Budget> Budgets { get; set; } = new();

        public List<MonthlyTrend> MonthlyTrends { get; set; } = new();
    }
}
