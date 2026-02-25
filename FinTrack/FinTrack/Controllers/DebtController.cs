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
    public class DebtController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public DebtController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var userId = _userManager.GetUserId(User);

            var debts = await _context.Debts
                .Where(d => d.UserId == userId)
                .OrderBy(d => d.Priority == "High" ? 0 : d.Priority == "Medium" ? 1 : 2)
                .ThenByDescending(d => d.RemainingBalance)
                .ToListAsync();

            var debtsWithStats = debts
                .Select(d => new DebtWithStats { Debt = d })
                .ToList();

            var viewModel = new DebtViewModel
            {
                Debts = debtsWithStats,
                NewDebt = new CreateDebtViewModel(),
                TotalDebt = debts.Sum(d => d.RemainingBalance),
                TotalMonthlyPayments = debts.Sum(d => d.MonthlyPayment),
                HighPriorityCount = debts.Count(d => d.Priority == "High"),
                DebtCount = debts.Count
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind(Prefix = "NewDebt")] CreateDebtViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
            {
                TempData["Error"] = "Please fill in all required fields correctly.";
                return RedirectToAction("Index");
            }

            var debt = new Debt
            {
                UserId = userId,
                Name = model.Name,
                DebtType = model.DebtType,
                OriginalAmount = model.OriginalAmount,
                RemainingBalance = model.RemainingBalance,
                MonthlyPayment = model.MonthlyPayment,
                InterestRate = model.InterestRate,
                StartDate = model.StartDate,
                ExpectedPayoffDate = model.ExpectedPayoffDate.GetValueOrDefault(DateTime.Today.AddYears(1)),
                Priority = model.Priority,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Debts.Add(debt);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Debt '{model.Name}' added successfully.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MakePayment(MakePaymentViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            var debt = await _context.Debts
                .FirstOrDefaultAsync(d => d.Id == model.DebtId && d.UserId == userId);

            if (debt == null)
            {
                TempData["Error"] = "Debt not found.";
                return RedirectToAction("Index");
            }

            debt.RemainingBalance -= model.Amount;
            debt.UpdatedAt = DateTime.UtcNow;

            if (debt.RemainingBalance <= 0)
            {
                debt.RemainingBalance = 0;
                TempData["Success"] = $"Congratulations! '{debt.Name}' is fully paid off!";
            }
            else
            {
                TempData["Success"] = $"Payment of ₦{model.Amount:N0} applied to '{debt.Name}'";
            }

            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var debt = await _context.Debts
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

            if (debt == null)
            {
                TempData["Error"] = "Debt not found.";
                return RedirectToAction("Index");
            }

            _context.Debts.Remove(debt);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"'{debt.Name}' removed.";
            return RedirectToAction("Index");
        }
    }
}
