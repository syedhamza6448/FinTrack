namespace FinTrack.Models
{
    public class SavingsGoal
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal SavedAmount { get; set; }
        public DateTime? TargetDate { get; set; }
        public string Status { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; }
    }
}
