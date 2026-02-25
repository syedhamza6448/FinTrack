using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models.ViewModels
{
    public class DebtViewModel
    {
        public List<DebtWithStats> Debts { get; set; } = new();
        public CreateDebtViewModel NewDebt { get; set; } = new();

        public decimal TotalDebt { get; set; }
        public decimal TotalMonthlyPayments { get; set; }
        public int HighPriorityCount { get; set; }
        public int DebtCount { get; set; }
    }

    public class DebtWithStats
    {
        public Debt Debt { get; set; } = null!;
        public decimal PaidOff => Debt.OriginalAmount - Debt.RemainingBalance;
        public int ProgressPercent => Debt.OriginalAmount > 0
            ? (int)Math.Min((PaidOff / Debt.OriginalAmount) * 100, 100)
            : 0;
        public int MonthsRemaining => Debt.MonthlyPayment > 0
            ? (int)Math.Ceiling((double)(Debt.RemainingBalance / Debt.MonthlyPayment))
            : 0;
    }

    public class CreateDebtViewModel
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string DebtType {  get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal OriginalAmount { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Remaining balance must be greater than 0")]
        public decimal RemainingBalance { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Monthly payment must be greate than 0")]
        public decimal MonthlyPayment { get; set; }

        [Range(0, 100)]
        public decimal InterestRate { get; set; }

        [Required]
        public DateTime StartDate { get; set; } = DateTime.Today;

        public DateTime? ExpectedPayoffDate { get; set; }

        [Required]
        public string Priority { get; set; } = "Medium";
    }

    public class MakePaymentViewModel
    {
        [Required]
        public int DebtId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Payment must be greater than 0.")]
        public decimal Amount { get; set; }
    }
}
