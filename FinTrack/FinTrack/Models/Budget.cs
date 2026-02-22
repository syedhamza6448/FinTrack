namespace FinTrack.Models
{
    public class Budget
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int CategoryId { get; set; }
        public decimal Amount { get; set; }
        public string Period { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser User { get; set; }
        public Category Category { get; set; }
    }
}
