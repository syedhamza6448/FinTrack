using FinTrack.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Runtime.CompilerServices;

namespace FinTrack.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Investment> Investments { get; set; }
        public DbSet<Debt> Debts { get; set; }
        public DbSet<SavingsGoal> SavingsGoals { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            //Decimal Precison

            //Transaction
            builder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            //Budget
            builder.Entity<Budget>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            //Investment
            builder.Entity<Investment>()
                .Property(i => i.BuyPrice)
                .HasPrecision(18, 2);
            builder.Entity<Investment>()
                .Property(i => i.CurrentPrice)
                .HasPrecision(18, 2);
            builder.Entity<Investment>()
                .Property(i => i.Quantity)
                .HasPrecision(18, 4);
            builder.Entity<Investment>()
                .Property(i => i.DividendEarned)
                .HasPrecision(18, 2);

            //Debt
            builder.Entity<Debt>()
                .Property(d => d.OriginalAmount)
                .HasPrecision(18, 2);
            builder.Entity<Debt>()
                .Property(d => d.RemainingBalance)
                .HasPrecision(18, 2);
            builder.Entity<Debt>()
                .Property(d => d.MonthlyPayment)
                .HasPrecision(18, 2);
            builder.Entity<Debt>()
                .Property(d => d.InterestRate)
                .HasPrecision(5, 2);

            //SavingsGoal
            builder.Entity<SavingsGoal>()
                .Property(s => s.TargetAmount)
                .HasPrecision(18, 2);
            builder.Entity<SavingsGoal>()
                .Property(s => s.SavedAmount)
                .HasPrecision(18, 2);


            //Fix Cascade Paths

            // Budget → Category: restrict instead of cascade
            builder.Entity<Budget>()
                .HasOne(b => b.Category)
                .WithMany(c => c.Budgets)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Transaction → Category: restrict instead of cascade
            builder.Entity<Transaction>()
                .HasOne(t => t.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
