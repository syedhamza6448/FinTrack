using FinTrack.Data;
using FinTrack.Models;
using FinTrack.Models.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly AppDbContext _context;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            AppDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
        }

        //Register
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var user = new ApplicationUser
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                UserName = model.Email,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await SeedDefaultCategories(user.Id);

                await _signInManager.SignInAsync(user, isPersistent: false);
                return RedirectToAction("Index", "Dashboard");
            }

            foreach (var error in result.Errors)
                ModelState.AddModelError(string.Empty, error.Description);

            return View(model);
        }

        //Login
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var result = await _signInManager.PasswordSignInAsync(
                model.Email,
                model.Password,
                model.RememberMe,
                lockoutOnFailure: false);

            if (result.Succeeded)
                return RedirectToAction("Index", "Dashboard");

            ModelState.AddModelError(string.Empty, "Invalid email or password");
            return View(model);
        }

        //Logout
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }

        //Forgot Password
        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            TempData["SuccessMessage"] = "If that email exists in our system, a reset link has been sent.";
            return RedirectToAction("ForgotPassword");
        }

        private async Task SeedDefaultCategories(string userId)
        {
            var defaults = new List<Category>
            {
                //Expense Categories
                new Category { UserId = userId, Name = "Food & Grocery",   Type = "Expense", Icon = "shoppingCart", Color = "#f43f5e", isDefault = true },
                new Category { UserId = userId, Name = "Transport",        Type = "Expense", Icon = "car",          Color = "#3b82f6", isDefault = true },
                new Category { UserId = userId, Name = "Entertainment",    Type = "Expense", Icon = "film",         Color = "#eab308", isDefault = true },
                new Category { UserId = userId, Name = "Utilities",        Type = "Expense", Icon = "zap",          Color = "#8b5cf6", isDefault = true },
                new Category { UserId = userId, Name = "Healthcare",       Type = "Expense", Icon = "pill",         Color = "#22c55e", isDefault = true },
                new Category { UserId = userId, Name = "Education",        Type = "Expense", Icon = "book",         Color = "#f97316", isDefault = true },
                new Category { UserId = userId, Name = "Shopping",         Type = "Expense", Icon = "bag",          Color = "#ec4899", isDefault = true },
                new Category { UserId = userId, Name = "Rent & Housing",   Type = "Expense", Icon = "home",         Color = "#14b8a6", isDefault = true },
                new Category { UserId = userId, Name = "Fuel",             Type = "Expense", Icon = "fuel",         Color = "#64748b", isDefault = true },
                new Category { UserId = userId, Name = "Other Expense",    Type = "Expense", Icon = "tag",          Color = "#94a3b8", isDefault = true },
            
                //Income Categories
                new Category { UserId = userId, Name = "Salary",           Type = "Income",  Icon = "dollarSign",   Color = "#22c55e", isDefault = true },
                new Category { UserId = userId, Name = "Freelance",        Type = "Income",  Icon = "briefcase",    Color = "#3b82f6", isDefault = true },
                new Category { UserId = userId, Name = "Investment Return", Type = "Income", Icon = "trendUp",      Color = "#eab308", isDefault = true },
                new Category { UserId = userId, Name = "Business",         Type = "Income",  Icon = "building",     Color = "#8b5cf6", isDefault = true },
                new Category { UserId = userId, Name = "Other Income",     Type = "Income",  Icon = "tag",          Color = "#94a3b8", isDefault = true },
            };

            _context.Categories.AddRange(defaults);
            await _context.SaveChangesAsync();  
        }
    }
}
