using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models.ViewModels
{
    public class SavingsViewModel
    {
        public List<SavingsGoal> Goals { get; set; } = new();
        public CreateSavingsGoalViewModel NewGoal { get; set; } = new();

        public decimal TotalSaved { get; set; }
        public decimal TotalTarget {  get; set; }
        public int CompletedGoals { get; set; }
        public int ActiveGoals { get; set; }
    }

    public class CreateSavingsGoalViewModel
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Target amount must be greater than 0.")]
        public decimal TargetAmount { get; set; }
        public decimal SavedAmount { get; set; } = 0;

        [Required]
        public DateTime TargetDate { get; set; } = DateTime.Today.AddMonths(6);

        public string? Icon { get; set; }
        public string? Color { get; set; }
    }

    public class AddFundsViewModel
    {
        [Required]
        public int GoalId {  get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }
    }
}
