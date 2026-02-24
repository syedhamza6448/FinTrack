using FinTrack.Data;
using FinTrack.Models;
using FinTrack.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace FinTrack.Controllers
{
    [Authorize]
    public class SavingsController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public SavingsController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var userId = _userManager.GetUserId(User);

            var goals = await _context.SavingsGoals
                .Where(g => g.UserId == userId)
                .OrderBy(g => g.Status)
                .ThenBy(g => g.TargetDate)
                .ToListAsync();

            var viewModel = new SavingsViewModel
            {
                Goals = goals,
                NewGoal = new CreateSavingsGoalViewModel(),
                TotalSaved = goals.Sum(g => g.SavedAmount),
                TotalTarget = goals.Sum(g => g.TargetAmount),
                CompletedGoals = goals.Count(g => g.Status == "Completed"),
                ActiveGoals = goals.Count(g => g.Status == "Active")
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind(Prefix = "NewGoal")] CreateSavingsGoalViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
            {
                TempData["Error"] = "Please fill all required fields.";
                return RedirectToAction("Index");
            }

            var goal = new SavingsGoal
            {
                UserId = userId,
                Name = model.Name,
                TargetAmount = model.TargetAmount,
                SavedAmount = model.SavedAmount,
                TargetDate = model.TargetDate,
                Status = model.SavedAmount >= model.TargetAmount ? "Completed" : "Active",
                Icon = model.Icon ?? "target",
                Color = model.Color ?? "#22c55e",
                CreatedAt = DateTime.UtcNow
            };

            _context.SavingsGoals.Add(goal);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Savings goal '{model.Name}' created!";
            return RedirectToAction("Index");

        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddFunds(AddFundsViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(g => g.Id == model.GoalId && g.UserId == userId);

            if (goal == null)
            {
                TempData["Error"] = "Goal not found.";
                return RedirectToAction("Index");
            }

            goal.SavedAmount += model.Amount;

            if (goal.SavedAmount >= goal.TargetAmount)
            {
                goal.SavedAmount = goal.TargetAmount;
                goal.Status = "Completed";
                TempData["Success"] = $"🎉 Congratulations! You reached your '{goal.Name}' goal!";
            }
            else
            {
                TempData["Success"] = $"₦{model.Amount:N0} added to '{goal.Name}'.";
            }

            await _context.SaveChangesAsync();
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> TogglePause(int id)
        {
            var userId = _userManager.GetUserId(User);

            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (goal == null)
            {
                TempData["Error"] = "Goal not found.";
                return RedirectToAction("Index");
            }

            if (goal.Status == "Completed")
            {
                TempData["Error"] = "Cannot pause a completed goal.";
                return RedirectToAction("Index");
            }

            goal.Status = goal.Status == "Active" ? "Paused" : "Active";
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Goal '{goal.Name}' is now {goal.Status}.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (goal == null)
            {
                TempData["Error"] = "Goal not found.";
                return RedirectToAction("Index");
            }

            _context.SavingsGoals.Remove(goal);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Goal '{goal.Name}' deleted.";
            return RedirectToAction("Index");
        }
    }
}
