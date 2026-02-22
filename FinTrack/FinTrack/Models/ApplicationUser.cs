using Microsoft.AspNetCore.Identity;
using System.Globalization;

namespace FinTrack.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? Occupation { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Currency { get; set; } = "NGN";
        public string Theme { get; set; } = "dark";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Process
        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Budget> Budgets { get; set; }
        public ICollection<Investment> Investments { get; set; }
        public ICollection<Debt> Debts { get; set; }
        public ICollection<SavingGoal> SavingGoals { get; set; }
        public ICollection<Notification> Notifications { get; set; }





    }
}
