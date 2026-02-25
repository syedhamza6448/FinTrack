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
    public class ReportsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReportsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index(int? month, int? year)
        {
            var userId = _userManager.GetUserId(User);
            var now = DateTime.UtcNow;

            var selectedMonth = month ?? now.Month;
            var selectedYear = year ?? now.Year;

            var monthTransactions = await _context.Transactions
                .Where(t => t.UserId == userId &&
                            t.Date.Month == selectedMonth &&
                            t.Date.Year == selectedYear)
                .Include(t => t.Category)
                .ToListAsync();

            var totalIncome = monthTransactions
                .Where(t => t.Type == "Income").Sum(t => t.Amount);
            var totalExpenses = monthTransactions
                .Where(t => t.Type == "Expense").Sum(t => t.Amount);

            var spendingByCategory = monthTransactions
                .Where(t => t.Type == "Expense" && t.Category != null)
                .GroupBy(t => new { t.Category!.Name, t.Category.Color })
                .Select(g => new CategorySpending
                {
                    CategoryName = g.Key.Name,
                    Color = g.Key.Color,
                    Amount = g.Sum(t => t.Amount),
                    Percentage = totalExpenses > 0
                        ? Math.Round((g.Sum(t => t.Amount) / totalExpenses) * 100, 1)
                        : 0
                })
                .OrderByDescending(c => c.Amount)
                .ToList();

            var trends = new List<MonthlyTrend>();
            for (int i = 5; i>= 0; i--)
            {
                var trendDate = new DateTime(selectedYear, selectedMonth, 1).AddMonths(-i);
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

            var topExpenses = monthTransactions
                .Where(t => t.Type == "Expense")
                .OrderByDescending(t => t.Amount)
                .Take(5)
                .ToList();

            var budgets = await _context.Budgets
                .Where(b => b.UserId == userId &&
                            b.Month == selectedMonth &&
                            b.Year == selectedYear)
                .Include(b => b.Category)
                .ToListAsync();

            var budgetPerformances = new List<BudgetPerfomance>();
            foreach (var budget in budgets)
            {
                var spent = monthTransactions
                    .Where(t => t.CategoryId == budget.CategoryId && t.Type == "Expense")
                    .Sum(t => t.Amount);

                budgetPerformances.Add(new BudgetPerfomance
                {
                    CategoryName = budget.Category?.Name ?? "Unknown",
                    Color = budget.Category?.Color ?? "#94a3b8",
                    Budgeted = budget.Amount,
                    Spent = spent
                });
            }

            var viewModel = new ReportsViewModel
            {
                SelectedMonth = selectedMonth,
                SelectedYear = selectedYear,
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                SpendingByCategory = spendingByCategory,
                MonthlyTrends = trends,
                TopExpenses = topExpenses,
                BudgetPerformances = budgetPerformances
            };

            return View(viewModel);
        }
    }
}
