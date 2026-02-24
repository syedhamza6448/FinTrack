using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models.ViewModels
{
    public class TransactionViewModel
    {
        public List<Transaction> Transactions { get; set; } = new();
        public List<Category> Categories { get; set; } = new();
        public CreateTransactionViewModel NewTransaction { get; set; } = new();

        public decimal TotalIncome {  get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetBalance => TotalIncome - TotalExpenses;
    }

    public class CreateTransactionViewModel
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public DateTime Date { get; set; } = DateTime.Today;

        public string? Notes { get; set; }
    }
}
