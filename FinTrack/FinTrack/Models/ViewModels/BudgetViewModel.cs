using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models.ViewModels
{
    public class BudgetViewModel
    {
        public List<BudgetWithSpending> Budgets { get; set; } = new();
        public List<Category> Categories { get; set; } = new();
        public CreateBudgetViewModel NewBudget { get; set; } = new();

        public decimal TotalBudgeted { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal Remaining => TotalBudgeted - TotalSpent;
        public int SelectedMonth { get; set; }
        public int SelectedYear { get; set; }
    }

    public class BudgetWithSpending
    {
        public Budget Budget { get; set; } = null!;
        public decimal Spent { get; set; }
        public decimal Remaining => Budget.Amount - Spent;
        public int ProgressPercent => Budget.Amount > 0
            ? (int)Math.Min((Spent / Budget.Amount) * 100, 100)
            : 0;
        public string StatusColor => ProgressPercent >= 100 ? "#f43f5e"
            : ProgressPercent >= 75 ? "#eab308"
            : "#22c55e";
    }

    public class CreateBudgetViewModel
    {
        [Required]
        public int CategoryId { get; set; }

        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }

        [Required]
        public string Period { get; set; } = "Monthly";

        public int Month { get; set; } = DateTime.Today.Month;
        public int Year { get; set; } = DateTime.Today.Year;
    }
}
