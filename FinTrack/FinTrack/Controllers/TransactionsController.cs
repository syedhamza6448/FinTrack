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
    public class TransactionsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TransactionsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index(string? type, int? categoryId, int? month, int? year)
        {
            var userId = _userManager.GetUserId(User);
            var now = DateTime.UtcNow;

            var selectedMonth = month ?? now.Month;
            var selectedYear = year ?? now.Year;

            var query = _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .AsQueryable();

            if (!string.IsNullOrEmpty(type))
                query = query.Where(t => t.CategoryId == categoryId);

            query = query.Where(t => t.Date.Month == selectedMonth && t.Date.Year == selectedYear);

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            var allForMonth = await _context.Transactions
                .Where(t => t.UserId == userId &&
                            t.Date.Month == selectedMonth &&
                            t.Date.Year == selectedYear)
                .ToListAsync();

            var categories = await _context.Categories
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .ToListAsync();

            var viewModel = new TransactionViewModel
            {
                Transactions = transactions,
                Categories = categories,
                NewTransaction = new CreateTransactionViewModel(),
                TotalIncome = allForMonth
                    .Where(t => t.Type == "Income").Sum(t => t.Amount),
                TotalExpenses = allForMonth
                    .Where(t => t.Type == "Expense").Sum(t => t.Amount),
            };

            ViewBag.SelectedType = type ?? "";
            ViewBag.SelectedCategory = categoryId ?? 0;
            ViewBag.SelectedMonth = selectedMonth;
            ViewBag.SelectedYear = selectedYear;

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind(Prefix = "NewTransaction")] CreateTransactionViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
            {
                var transactions = await _context.Transactions
                    .Where(t => t.UserId == userId)
                    .Include(t => t.Category)
                    .OrderByDescending(t => t.Date)
                    .ToListAsync();

                var categories = await _context.Categories
                    .Where(c => c.UserId == userId)
                    .ToListAsync();

                return View("Index", new TransactionViewModel
                {
                    Transactions = transactions,
                    Categories = categories,
                    NewTransaction = model
                });
            }

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == model.CategoryId && c.UserId == userId);

            if (category == null)
            {
                ModelState.AddModelError(string.Empty, "Invalid category selected.");
                return RedirectToAction("Index");
            }

            var transaction = new Transaction
            {
                UserId = userId,
                CategoryId = model.CategoryId,
                Description = model.Description,
                Amount = model.Amount,
                Type = model.Type,
                Date = model.Date,
                Notes = model.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Transaction '{model.Description}' added successfully";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (transaction == null)
            {
                TempData["Error"] = "Transaction not found.";
                return RedirectToAction("Index");
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            TempData["Success"] = "Transaction deleted.";
            return RedirectToAction("Index");
        }
    }
}
