using FinTrack.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DashboardController(AppDbContext db) => _db = db;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/dashboard
        // Returns everything the dashboard page needs in one request
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var now = DateTime.UtcNow;
            var thisMonth = new DateTime(now.Year, now.Month, 1);
            var lastMonth = thisMonth.AddMonths(-1);

            // ── This month stats ────────────────────────────────────
            var thisMonthTx = await _db.Transactions
                .Where(t => t.UserId == UserId &&
                             t.Date.Month == now.Month &&
                             t.Date.Year == now.Year)
                .ToListAsync();

            var income = thisMonthTx.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var expense = thisMonthTx.Where(t => t.Type == "Expense").Sum(t => t.Amount);

            // ── Last month for comparison ────────────────────────────
            var lastMonthTx = await _db.Transactions
                .Where(t => t.UserId == UserId &&
                             t.Date.Month == lastMonth.Month &&
                             t.Date.Year == lastMonth.Year)
                .ToListAsync();

            var lastIncome = lastMonthTx.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var lastExpense = lastMonthTx.Where(t => t.Type == "Expense").Sum(t => t.Amount);

            // ── Net worth ────────────────────────────────────────────
            var totalSavings = await _db.SavingsGoals.Where(s => s.UserId == UserId).SumAsync(s => s.SavedAmount);
            var totalInvestments = await _db.Investments.Where(i => i.UserId == UserId).SumAsync(i => i.Quantity * i.CurrentPrice);
            var totalDebt = await _db.Debts.Where(d => d.UserId == UserId).SumAsync(d => d.RemainingBalance);
            var netWorth = totalSavings + totalInvestments - totalDebt;

            // ── Recent transactions (last 8) ─────────────────────────
            var recent = await _db.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == UserId)
                .OrderByDescending(t => t.Date)
                .Take(8)
                .Select(t => new
                {
                    t.Id,
                    t.Description,
                    t.Amount,
                    t.Type,
                    t.Date,
                    category = new { t.Category!.Name, t.Category.Icon, t.Category.Color }
                })
                .ToListAsync();

            // ── Active savings goals (top 3) ─────────────────────────
            var goals = await _db.SavingsGoals
                .Where(s => s.UserId == UserId && s.Status == "Active")
                .OrderByDescending(s => s.SavedAmount / s.TargetAmount)
                .Take(3)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.TargetAmount,
                    s.SavedAmount,
                    s.Icon,
                    s.Color,
                    progressPercent = s.TargetAmount > 0
                        ? Math.Round(s.SavedAmount / s.TargetAmount * 100, 1)
                        : 0
                })
                .ToListAsync();

            // ── Budget alerts ────────────────────────────────────────
            var budgets = await _db.Budgets
                .Include(b => b.Category)
                .Where(b => b.UserId == UserId &&
                             b.Month == now.Month &&
                             b.Year == now.Year)
                .ToListAsync();

            var budgetAlerts = new List<object>();
            foreach (var b in budgets)
            {
                var spent = thisMonthTx
                    .Where(t => t.CategoryId == b.CategoryId && t.Type == "Expense")
                    .Sum(t => t.Amount);

                var pct = b.Amount > 0 ? Math.Round(spent / b.Amount * 100, 1) : 0;
                if (pct >= 75)
                {
                    budgetAlerts.Add(new
                    {
                        categoryName = b.Category!.Name,
                        icon = b.Category.Color,
                        budgeted = b.Amount,
                        spent,
                        percentUsed = pct,
                        status = pct >= 100 ? "exceeded" : "warning"
                    });
                }
            }

            // ── Unread notifications count ───────────────────────────
            var unreadCount = await _db.Notifications
                .CountAsync(n => n.UserId == UserId && !n.IsRead);

            return Ok(new
            {
                stats = new
                {
                    income,
                    expense,
                    netBalance = income - expense,
                    netWorth,
                    savingsRate = income > 0 ? Math.Round((income - expense) / income * 100, 1) : 0,
                    // month-over-month deltas
                    incomeDelta = lastIncome > 0 ? Math.Round((income - lastIncome) / lastIncome * 100, 1) : 0,
                    expenseDelta = lastExpense > 0 ? Math.Round((expense - lastExpense) / lastExpense * 100, 1) : 0
                },
                recentTransactions = recent,
                savingsGoals = goals,
                budgetAlerts,
                unreadNotifications = unreadCount
            });
        }
    }
}