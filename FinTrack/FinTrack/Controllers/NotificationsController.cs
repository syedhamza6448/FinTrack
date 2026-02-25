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
    public class NotificationsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var userId = _userManager.GetUserId(User);

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            var viewModel = new NotificationsViewModel
            {
                Notifications = notifications,
                UnreadCount = notifications.Count(n => !n.IsRead),
                TotalCount = notifications.Count
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Refresh()
        {
            var userId = _userManager.GetUserId(User);
            await GenerateNotifications(userId);
            TempData["Success"] = "Notifications refreshed.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkRead(int id)
        {
            var userId = _userManager.GetUserId(User);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if(notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MarkAllRead()
        {
            var userId = _userManager.GetUserId(User);

            var unread = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            unread.ForEach(n => n.IsRead = true);
            await _context.SaveChangesAsync();

            TempData["Success"] = "All notifications marked as read.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification != null)
            {
                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();
            }

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ClearALl()
        {
            var userId = _userManager.GetUserId(User);

            var all = await _context.Notifications
                .Where(n => n.UserId == userId)
                .ToListAsync();

            _context.Notifications.RemoveRange(all);
            await _context.SaveChangesAsync();

            TempData["Success"] = "All notifications cleared.";
            return RedirectToAction("Index");
        }

        private async Task GenerateNotifications(string userId)
        {
            var now = DateTime.UtcNow;
            var today = DateTime.Today;

            async Task AddIfNew(string type, string title, string message, string severity)
            {
                var exists = await _context.Notifications
                    .AnyAsync(n => n.UserId == userId && n.Title == title);

                if (!exists)
                {
                    _context.Notifications.Add(new Notification
                    {
                        UserId = userId,
                        Title = title,
                        Message = message,
                        Type = type,
                        Severity = severity,
                        IsRead = false,
                        CreatedAt = now
                    });
                }
            }

            var budgets = await _context.Budgets
                .Where(b => b.UserId == userId &&
                            b.Month == now.Month &&
                            b.Year == now.Year)
                .Include(b => b.Category)
                .ToListAsync();

            foreach (var budget in budgets)
            {
                var spent = await _context.Transactions
                    .Where(t => t.UserId == userId &&
                                t.CategoryId == budget.CategoryId &&
                                t.Type == "Expense" &&
                                t.Date.Month == now.Month &&
                                t.Date.Year == now.Year)
                    .SumAsync(t => t.Amount);

                var pct = budget.Amount > 0 ? (spent / budget.Amount) : 0;

                if (pct >= 100)
                    await AddIfNew("Budget", $"Budget exceeded: {budget.Category?.Name}",
                        $"You have exceeded your {budget.Category?.Name} budget by ₦{(spent - budget.Amount):N0}.", "danger");
                else if (pct >= 80)
                    await AddIfNew("Budget", $"Budget warning: {budget.Category?.Name}",
                        $"You have user {Math.Round(pct, 0)}% of your {budget.Category?.Name} budget.", "warning");
            }

            var goals = await _context.SavingsGoals
                .Where(g => g.UserId == userId && g.Status == "Active")
                .ToListAsync();

            foreach (var goal in goals)
            {
                var pct = goal.TargetAmount > 0
                    ? (goal.SavedAmount / goal.TargetAmount) * 100 : 0;

                if (pct >= 100)
                    await AddIfNew("Savings", $"Goal completed: {goal.Name}",
                        $"Congratulations! You have reached your '{goal.Name}'savings goal!", "success");
                else if (pct >= 75)
                    await AddIfNew("Savings", $"Almost there: {goal.Name}",
                        $"You are {Math.Round(pct, 0)}% of the way to your '{goal.Name}' goal!", "info");

                if (goal.TargetDate.HasValue && goal.TargetDate.Value < today && pct < 100)
                    await AddIfNew("Savings", $"Goal overdue: {goal.Name}",
                        $"Your savings goal '{goal.Name}' passed its target date. Keep going!", "warning");
            }

            var debts = await _context.Debts
                .Where(d => d.UserId == userId && d.RemainingBalance > 0)
                .ToListAsync();

            foreach (var debt in debts)
            {
                if (debt.Priority == "High")
                    await AddIfNew("Debt", $"High priority debt: {debt.Name}",
                        $"You have a high priority debt '{debt.Name}' with ₦{debt.RemainingBalance:N0} remaining.", "danger");

                if (debt.ExpectedPayoffDate != default(DateTime) &&
                    debt.ExpectedPayoffDate <= today.AddDays(30))
                    await AddIfNew("Debt", $"Debt due soon: {debt.Name}",
                        $"Your debt '{debt.Name}' is due within 30 days.", "warning");
            }

            var totalIncome = await _context.Transactions
                .Where(t => t.UserId == userId &&
                            t.Type == "Income" &&
                            t.Date.Month == now.Month &&
                            t.Date.Year == now.Year)
                .SumAsync(t => t.Amount);

            var totalExpenses = await _context.Transactions
                .Where(t => t.UserId == userId &&
                            t.Type == "Expense" &&
                            t.Date.Month == now.Month &&
                            t.Date.Year == now.Year)
                .SumAsync(t => t.Amount);

            if (totalIncome > 0 && totalExpenses > totalIncome * 0.9m)
                await AddIfNew("Balance", "High spending alert",
                    $"Your expenses this month are over 90% of your income. Consider reducing spending.", "warning");
            
            await _context.SaveChangesAsync();
        }
    }
}
