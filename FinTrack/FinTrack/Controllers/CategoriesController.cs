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
    public class CategoriesController : Controller
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CategoriesController(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var userId = _userManager.GetUserId(User);

            var categories = await _context.Categories
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .ToListAsync();

            var viewModel = new CategoryViewModel
            {
                Categories = categories,
                NewCategory = new CreateCategoryViewModel()
            };

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind(Prefix = "NewCategory")] CreateCategoryViewModel model)
        {
            var userId = _userManager.GetUserId(User);

            if (!ModelState.IsValid)
            {
                var categories = await _context.Categories
                    .Where(c => c.UserId == userId)
                    .OrderBy(c => c.Type)
                    .ThenBy(c => c.Name)
                    .ToListAsync();

                return View("Index", new CategoryViewModel
                {
                    Categories = categories,
                    NewCategory = model
                });
            }

            var exists = await _context.Categories
                .AnyAsync(c => c.UserId == userId &&
                               c.Name.ToLower() == model.Name.ToLower()  &&
                               c.Type == model.Type);

            if (exists)
            {
                ModelState.AddModelError(string.Empty,
                    $"A {model.Type} category named '{model.Name}' already exists.");

                var categories = await _context.Categories
                    .Where(c => c.UserId == userId)
                    .OrderBy(c => c.Type)
                    .ThenBy(c => c.Name)
                    .ToListAsync();
                return View("Index", new CategoryViewModel
                {
                    Categories = categories,
                    NewCategory = model
                });
            }

            var category = new Category
            {
                UserId = userId,
                Name = model.Name,
                Type = model.Type,
                Icon = model.Icon ?? "tag",
                Color = model.Color ?? "#f43f5e",
                isDefault= false
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Category '{model.Name}' created successfully.";
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = _userManager.GetUserId(User);

            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
            {
                TempData["Error"] = "Category not found.";
                return RedirectToAction("Index");
            }

            var hasTransactions = await _context.Transactions
                .AnyAsync(t => t.CategoryId == id);

            if (hasTransactions)
            {
                TempData["Error"] = $"Cannot delete '{category.Name}'; it has transactions link to it. Reassign them first.";
                return RedirectToAction("Index");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            TempData["Success"] = $"Category '{category.Name}' deleted.";
            return RedirectToAction("Index");
        }
    }
}
