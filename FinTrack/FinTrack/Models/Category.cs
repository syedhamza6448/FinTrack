namespace FinTrack.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public bool isDefault { get; set; } = false;

        public ApplicationUser User { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Budget> Budgets { get; set; }
    }
}
