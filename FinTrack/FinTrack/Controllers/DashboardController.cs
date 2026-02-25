using FinTrack.Data;
using FinTrack.Models;
using FinTrack.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DashboardController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var userId = _userManager.GetUserId(User);

            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var totalIncome = await _context.Transactions
                .Where(t => t.UserId == userId && t.Type == "Income")
                .SumAsync(t => t.Amount);

            var totalExpenses = await _context.Transactions
                .Where(t => t.UserId == userId && t.Type == "Expense")
                .SumAsync(t => t.Amount);

            var monthlySpending = await _context.Transactions
                .Where(t => t.UserId == userId && t.Type == "Expense" && t.Date >= startOfMonth)
                .SumAsync(t => t.Amount);

            var totalSavings = await _context.SavingsGoals
                .Where(s => s.UserId == userId)
                .SumAsync(s => s.SavedAmount);

            var recenetTransactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .OrderByDescending(t => t.Date)
                .Take(5)
                .ToListAsync();

            var savingsGoals = await _context.SavingsGoals
                .Where(s => s.UserId == userId && s.Status == "Active")
                .Take(3)
                .ToListAsync();

            var budgets = await _context.Budgets
                .Where(b => b.UserId == userId && b.Month == now.Month && b.Year == now.Year)
                .Include(b => b.Category)
                .ToListAsync();

            var trends = new List<MonthlyTrend>();
            for (int i = 5; i >= 0; i--)
            {
                var trendDate = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                var trendTx = await _context.Transactions
                    .Where(t => t.UserId == userId &&
                                t.Date.Month == trendDate.Month &&
                                t.Date.Year == trendDate.Year)
                    .ToListAsync();

                trends.Add(new MonthlyTrend
                {
                    MonthLabel = trendDate.ToString("MMM yy"),
                    Income = trendTx.Where(t => t.Type == "Income").Sum(t => t.Amount),
                    Expenses = trendTx.Where(t => t.Type == "Expense").Sum(t => t.Amount)
                });
            }

            var viewModel = new DashboardViewModel
            {
                TotalBalance = totalIncome - totalExpenses,
                MonthlySpending = monthlySpending,
                TotalSavings = totalSavings,
                TotalBudget = budgets.Sum(b => b.Amount),
                RecentTransactions = recenetTransactions,
                SavingsGoals = savingsGoals,
                Budgets = budgets,
                MonthlyTrends = trends,
                UserFirstName = User.Identity?.Name?.Split('@')[0] ?? "User"
            };

            return View(viewModel);
        }
    }
}
