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
    public class ExpensesController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ExpensesController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index(int? categoryId, int? month, int? year)
        {
            var userId = _userManager.GetUserId(User);
            var now = DateTime.UtcNow;

            var selectedMonth = month ?? now.Month;
            var selectedYear = year ?? now.Year;

            // Base query — expenses only
            var query = _context.Transactions
                .Where(t => t.UserId == userId && t.Type == "Expense")
                .Include(t => t.Category)
                .AsQueryable();

            // Month/year filter
            query = query.Where(t =>
                t.Date.Month == selectedMonth &&
                t.Date.Year == selectedYear);

            // Category filter
            if (categoryId.HasValue && categoryId > 0)
                query = query.Where(t => t.CategoryId == categoryId);

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            // All expenses for the month (unfiltered by category) for stats
            var allExpenses = await _context.Transactions
                .Where(t => t.UserId == userId &&
                            t.Type == "Expense" &&
                            t.Date.Month == selectedMonth &&
                            t.Date.Year == selectedYear)
                .Include(t => t.Category)
                .ToListAsync();

            // Expense-only categories
            var categories = await _context.Categories
                .Where(c => c.UserId == userId && c.Type == "Expense")
                .OrderBy(c => c.Name)
                .ToListAsync();

            // Category breakdown
            var totalExpenses = allExpenses.Sum(t => t.Amount);
            var categoryBreakdown = allExpenses
                .GroupBy(t => t.Category)
                .Select(g => new ExpenseCategoryBreakdown
                {
                    CategoryName = g.Key?.Name ?? "Uncategorized",
                    Color = g.Key?.Color ?? "#94a3b8",
                    Amount = g.Sum(t => t.Amount),
                    Count = g.Count(),
                    Percentage = totalExpenses > 0
                        ? (int)Math.Round((g.Sum(t => t.Amount) / totalExpenses) * 100)
                        : 0
                })
                .OrderByDescending(c => c.Amount)
                .ToList();

            var topCategory = categoryBreakdown.FirstOrDefault();

            var viewModel = new ExpenseViewModel
            {
                Transactions = transactions,
                Categories = categories,
                NewTransaction = new CreateTransactionViewModel { Type = "Expense" },
                TotalExpenses = totalExpenses,
                LargestExpense = allExpenses.Any() ? allExpenses.Max(t => t.Amount) : 0,
                TopCategory = topCategory?.CategoryName ?? "—",
                TransactionCount = allExpenses.Count,
                CategoryBreakdown = categoryBreakdown,
                SelectedMonth = selectedMonth,
                SelectedYear = selectedYear
            };

            ViewBag.SelectedCategory = categoryId ?? 0;

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(
            [Bind(Prefix = "NewTransaction")] CreateTransactionViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            // Force expense type
            model.Type = "Expense";

            if (!ModelState.IsValid)
            {
                TempData["Error"] = "Please fill in all required fields.";
                return RedirectToAction("Index");
            }

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == model.CategoryId && c.UserId == userId);

            if (category == null)
            {
                TempData["Error"] = "Invalid category selected.";
                return RedirectToAction("Index");
            }

            var transaction = new Transaction
            {
                UserId = userId,
                CategoryId = model.CategoryId,
                Description = model.Description,
                Amount = model.Amount,
                Type = "Expense",
                Date = model.Date,
                Notes = model.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Expense '{model.Description}' added successfully.";
            return RedirectToAction("Index",
                new { month = model.Date.Month, year = model.Date.Year });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id &&
                                          t.UserId == userId &&
                                          t.Type == "Expense");

            if (transaction == null)
            {
                TempData["Error"] = "Expense not found.";
                return RedirectToAction("Index");
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            TempData["Success"] = "Expense deleted.";
            return RedirectToAction("Index");
        }
    }
}