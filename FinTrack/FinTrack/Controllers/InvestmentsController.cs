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
    public class InvestmentsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public InvestmentsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index(string? assetType)
        {
            var userId = _userManager.GetUserId(User);

            var query = _context.Investments
                .Where(i => i.UserId == userId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(assetType))
                query = query.Where(i => i.AssetType == assetType);

            var investments = await query
                .OrderByDescending(i => i.PurchaseDate)
                .ToListAsync();

            var investmentsWithStats = investments
                .Select(i => new InvestmentWithStats { Investment = i })
                .ToList();

            var viewModel = new InvestmentViewModel
            {
                Investments = investmentsWithStats,
                NewInvestment = new CreateInvestmentViewModel(),
                TotalInvested = investmentsWithStats.Sum(i => i.TotalCost),
                TotalCurrentValue = investmentsWithStats.Sum(i => i.CurrentValue),
                TotalDividends = investments.Sum(i => i.DividendEarned ?? 0)
            };

            ViewBag.SelectedType = assetType ?? "";
            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind(Prefix = "NewInvestment")] CreateInvestmentViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
            {
                TempData["Error"] = "Please fill in all required fields correctly.";
                return RedirectToAction("Index");
            }

            var investment = new Investment
            {
                UserId = userId,
                Name = model.Name,
                Ticker = string.IsNullOrEmpty(model.Ticker) ? "N/A" : model.Ticker.ToUpper(),
                AssetType = model.AssetType,
                Quantity = model.Quantity,
                BuyPrice = model.BuyPrice,
                CurrentPrice = model.CurrentPrice,
                PurchaseDate = model.PurchaseDate,
                DividendEarned = model.DividendEarned,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Investment '{model.Name}' added successfully.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdatePrice(int id, decimal currentPrice)
        {
            var userId = _userManager.GetUserId(User);

            var investment = await _context.Investments
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

            if (investment == null)
            {
                TempData["Error"] = "Investment not found.";
                return RedirectToAction("Index");
            }

            investment.CurrentPrice = currentPrice;
            investment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Price updated for '{investment.Name}'.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var investment = await _context.Investments
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

            if (investment == null)
            {
                TempData["Error"] = "Investment not found.";
                return RedirectToAction("Index");
            }

            _context.Investments.Remove(investment);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Investment '{investment.Name}' deleted.";
            return RedirectToAction("Index");
        }
    }
}
