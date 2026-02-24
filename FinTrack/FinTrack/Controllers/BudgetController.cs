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
    public class BudgetController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public BudgetController(AppDbContext context, UserManager<ApplicationUser> userManager)
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

            var budgets = await _context.Budgets
                .Where(b => b.UserId == userId &&
                            b.Month == selectedMonth &&
                            b.Year == selectedYear)
                .Include(b => b.Category)
                .ToListAsync();

            var budgetWithSpending = new List<BudgetWithSpending>();

            foreach (var budget in budgets)
            {
                var spent = await _context.Transactions
                    .Where(t => t.UserId == userId &&
                                t.CategoryId == budget.CategoryId &&
                                t.Type == "Expense" &&
                                t.Date.Month == selectedMonth &&
                                t.Date.Year == selectedYear)
                    .SumAsync(t => t.Amount);

                budgetWithSpending.Add(new BudgetWithSpending
                {
                    Budget = budget,
                    Spent = spent
                });
            }

            var categories = await _context.Categories
                .Where(c => c.UserId == userId && c.Type == "Expense")
                .OrderBy(c => c.Name)
                .ToListAsync();

            var viewModel = new BudgetViewModel
            {
                Budgets = budgetWithSpending,
                Categories = categories,
                NewBudget = new CreateBudgetViewModel
                {
                    Month = selectedMonth,
                    Year = selectedYear
                },
                TotalBudgeted = budgets.Sum(b => b.Amount),
                TotalSpent = budgetWithSpending.Sum(b => b.Spent),
                SelectedMonth = selectedMonth,
                SelectedYear = selectedYear
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind(Prefix = "NewBudget")] CreateBudgetViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
            {
                return RedirectToAction("Index",
                    new { month = model.Month, year = model.Year });
            }

            var exists = await _context.Budgets
                .AnyAsync(b => b.UserId == userId &&
                               b.CategoryId == model.CategoryId &&
                               b.Month == model.Month &&
                               b.Year == model.Year);

            if (exists)
            {
                TempData["Error"] = "A budget for this category already exists for the selected month.";
                return RedirectToAction("Index",
                    new { month = model.Month, year = model.Year });
            }

            var budget = new Budget
            {
                UserId = userId,
                CategoryId = model.CategoryId,
                Amount = model.Amount,
                Period = model.Period,
                Month = model.Month,
                Year = model.Year,
                CreatedAt = DateTime.UtcNow
            };

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();

            TempData["Success"] = "Budget created successfully.";
            return RedirectToAction("Index",
                new { month = model.Month, year = model.Year });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (budget == null)
            {
                TempData["Error"] = "Budget not found.";
                return RedirectToAction("Index");
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            TempData["Success"] = "Budget deleted.";
            return RedirectToAction("Index",
                new { month = budget.Month, year = budget.Year });
        }
    }
}
