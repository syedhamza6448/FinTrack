using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models.ViewModels
{
    public class InvestmentViewModel
    {
        public List<InvestmentWithStats> Investments { get; set; } = new();
        public CreateInvestmentViewModel NewInvestment { get; set; } = new();

        public decimal TotalInvested { get; set; }
        public decimal TotalCurrentValue { get; set; }
        public decimal TotalGainLoss => TotalCurrentValue - TotalInvested;
        public decimal TotalGainLossPercent => TotalInvested > 0
            ? Math.Round((TotalGainLoss / TotalInvested) * 100, 2)
            : 0;
        public decimal TotalDividends {  get; set; }
    }

    public class InvestmentWithStats
    {
        public Investment Investment { get; set; } = null!;
        public decimal TotalCost => Investment.Quantity * Investment.BuyPrice;
        public decimal CurrentValue => Investment.Quantity * Investment.CurrentPrice;
        public decimal GainLoss => CurrentValue - TotalCost;
        public decimal GainLossPercent => TotalCost > 0
            ? Math.Round((GainLoss / TotalCost) * 100, 2)
            : 0;
        public bool IsProfit => GainLoss >= 0;
    }

    public class CreateInvestmentViewModel
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Ticker { get; set; }

        [Required]
        public string AssetType { get; set; } = string.Empty;

        [Required]
        [Range(0.0001, double.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public decimal Quantity {  get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Buy price must be greater than 0.")]
        public decimal BuyPrice { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Current price must be greater than 0.")]
        public decimal CurrentPrice { get; set; }

        [Required]
        public DateTime PurchaseDate { get; set; } = DateTime.Today;

        public decimal DividendEarned { get; set; } = 0;
    }
}
