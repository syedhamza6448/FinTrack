namespace FinTrack.Models
{
    public class Debt
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string DebtType { get; set; }
        public decimal OriginalAmount { get; set; }
        public decimal RemainingBalance { get; set; }
        public decimal MonthlyPayment { get; set; }
        public decimal InterestRate {  get; set; }
        public DateTime StartDate { get; set; }
        public DateTime ExpectedPayoffDate { get; set; }
        public string Priority { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ApplicationUser User { get; set; }
    }
}
