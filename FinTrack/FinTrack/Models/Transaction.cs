namespace FinTrack.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public string UserId {  get; set; }
        public int CategoryId { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; }
        public DateTime Date { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; }
        public Category Category { get; set; }
    }
}
