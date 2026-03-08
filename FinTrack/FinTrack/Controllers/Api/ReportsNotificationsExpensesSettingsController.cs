using FinTrack.Data;
using FinTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

// ═══════════════════════════════════════════
// REPORTS CONTROLLER
// ═══════════════════════════════════════════
namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReportsController(AppDbContext db) => _db = db;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/reports/monthly?year=2026
        // Returns month-by-month income vs expense for a full year (for line/bar chart)
        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthly([FromQuery] int? year = null)
        {
            var targetYear = year ?? DateTime.UtcNow.Year;

            var data = await _db.Transactions
                .Where(t => t.UserId == UserId && t.Date.Year == targetYear)
                .GroupBy(t => new { t.Date.Month, t.Type })
                .Select(g => new
                {
                    month = g.Key.Month,
                    type = g.Key.Type,
                    total = g.Sum(t => t.Amount)
                })
                .ToListAsync();

            // Build 12-month array
            var months = Enumerable.Range(1, 12).Select(m => new
            {
                month = m,
                label = new DateTime(targetYear, m, 1).ToString("MMM"),
                income = data.FirstOrDefault(d => d.month == m && d.type == "Income")?.total ?? 0,
                expense = data.FirstOrDefault(d => d.month == m && d.type == "Expense")?.total ?? 0
            }).Select(m => new
            {
                m.month,
                m.label,
                m.income,
                m.expense,
                net = m.income - m.expense,
                savings = m.income > 0 ? Math.Round((m.income - m.expense) / m.income * 100, 1) : 0
            });

            return Ok(months);
        }

        // GET api/reports/by-category?month=2026-02&type=Expense
        // Returns spending breakdown by category (for doughnut/pie chart)
        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory(
            [FromQuery] string? month = null,
            [FromQuery] string type = "Expense")
        {
            var query = _db.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == UserId && t.Type == type);

            if (!string.IsNullOrEmpty(month) &&
                DateTime.TryParse(month + "-01", out var parsed))
            {
                query = query.Where(t => t.Date.Year == parsed.Year &&
                                          t.Date.Month == parsed.Month);
            }

            var data = await query
                .GroupBy(t => new { t.CategoryId, t.Category!.Name, t.Category.Color, t.Category.Icon })
                .Select(g => new
                {
                    categoryId = g.Key.CategoryId,
                    categoryName = g.Key.Name,
                    color = g.Key.Color,
                    icon = g.Key.Icon,
                    total = g.Sum(t => t.Amount),
                    count = g.Count()
                })
                .OrderByDescending(g => g.total)
                .ToListAsync();

            var grandTotal = data.Sum(d => d.total);

            return Ok(data.Select(d => new
            {
                d.categoryId,
                d.categoryName,
                d.color,
                d.icon,
                d.total,
                d.count,
                percentage = grandTotal > 0
                    ? Math.Round(d.total / grandTotal * 100, 1)
                    : 0
            }));
        }

        // GET api/reports/daily?month=2026-02
        // Returns daily totals (for area chart / calendar view)
        [HttpGet("daily")]
        public async Task<IActionResult> GetDaily([FromQuery] string? month = null)
        {
            var now = DateTime.UtcNow;
            int filterMonth = now.Month, filterYear = now.Year;

            if (!string.IsNullOrEmpty(month) && DateTime.TryParse(month + "-01", out var parsed))
            {
                filterMonth = parsed.Month; filterYear = parsed.Year;
            }

            var data = await _db.Transactions
                .Where(t => t.UserId == UserId &&
                             t.Date.Month == filterMonth &&
                             t.Date.Year == filterYear)
                .GroupBy(t => new { t.Date.Day, t.Type })
                .Select(g => new { day = g.Key.Day, type = g.Key.Type, total = g.Sum(t => t.Amount) })
                .ToListAsync();

            var daysInMonth = DateTime.DaysInMonth(filterYear, filterMonth);
            var result = Enumerable.Range(1, daysInMonth).Select(d => new
            {
                day = d,
                income = data.FirstOrDefault(x => x.day == d && x.type == "Income")?.total ?? 0,
                expense = data.FirstOrDefault(x => x.day == d && x.type == "Expense")?.total ?? 0
            });

            return Ok(result);
        }

        // GET api/reports/net-worth
        // Calculates current net worth = total savings goals + investments - total debt
        [HttpGet("net-worth")]
        public async Task<IActionResult> GetNetWorth()
        {
            var totalSavings = await _db.SavingsGoals
                .Where(s => s.UserId == UserId).SumAsync(s => s.SavedAmount);
            var totalInvestments = await _db.Investments
                .Where(i => i.UserId == UserId).SumAsync(i => i.Quantity * i.CurrentPrice);
            var totalDebt = await _db.Debts
                .Where(d => d.UserId == UserId).SumAsync(d => d.RemainingBalance);

            return Ok(new
            {
                totalSavings,
                totalInvestments,
                totalDebt,
                netWorth = totalSavings + totalInvestments - totalDebt,
                assets = totalSavings + totalInvestments,
                liabilities = totalDebt
            });
        }
    }
}


// ═══════════════════════════════════════════
// NOTIFICATIONS CONTROLLER
// ═══════════════════════════════════════════
namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public NotificationsController(AppDbContext db) => _db = db;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/notifications
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool unreadOnly = false)
        {
            var query = _db.Notifications
                .Where(n => n.UserId == UserId);

            if (unreadOnly) query = query.Where(n => !n.IsRead);

            var items = await query
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new { n.Id, n.Title, n.Message, n.Type, n.IsRead, n.CreatedAt })
                .ToListAsync();

            var unreadCount = await _db.Notifications
                .CountAsync(n => n.UserId == UserId && !n.IsRead);

            return Ok(new { items, unreadCount });
        }

        // PATCH api/notifications/5/read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var n = await _db.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == UserId);

            if (n == null) return NotFound();
            n.IsRead = true;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // PATCH api/notifications/read-all
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllRead()
        {
            var notifications = await _db.Notifications
                .Where(n => n.UserId == UserId && !n.IsRead)
                .ToListAsync();

            notifications.ForEach(n => n.IsRead = true);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/notifications/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var n = await _db.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == UserId);

            if (n == null) return NotFound();
            _db.Notifications.Remove(n);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET api/notifications/unread-count  (for the badge in topbar)
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var count = await _db.Notifications
                .CountAsync(n => n.UserId == UserId && !n.IsRead);
            return Ok(new { count });
        }
    }
}


// ═══════════════════════════════════════════
// EXPENSES CONTROLLER
// (alias for transactions filtered to Expense type — keeps Angular service clean)
// ═══════════════════════════════════════════
namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ExpensesController(AppDbContext db) => _db = db;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/expenses?month=2026-02&categoryId=3
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? month = null,
            [FromQuery] int? categoryId = null)
        {
            var query = _db.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == UserId && t.Type == "Expense");

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId.Value);

            if (!string.IsNullOrEmpty(month) &&
                DateTime.TryParse(month + "-01", out var parsed))
            {
                query = query.Where(t => t.Date.Year == parsed.Year &&
                                          t.Date.Month == parsed.Month);
            }

            var items = await query
                .OrderByDescending(t => t.Date)
                .Select(t => new
                {
                    t.Id,
                    t.Description,
                    t.Amount,
                    t.Date,
                    t.Notes,
                    category = new { t.Category!.Id, t.Category.Name, t.Category.Icon, t.Category.Color }
                })
                .ToListAsync();

            var totalAmount = items.Sum(t => t.Amount);

            return Ok(new { items, totalAmount, count = items.Count });
        }

        // GET api/expenses/top-categories?month=2026-02  (for expenses page chart)
        [HttpGet("top-categories")]
        public async Task<IActionResult> GetTopCategories([FromQuery] string? month = null)
        {
            var now = DateTime.UtcNow;
            int filterMonth = now.Month, filterYear = now.Year;

            if (!string.IsNullOrEmpty(month) && DateTime.TryParse(month + "-01", out var p))
            { filterMonth = p.Month; filterYear = p.Year; }

            var data = await _db.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == UserId &&
                             t.Type == "Expense" &&
                             t.Date.Month == filterMonth &&
                             t.Date.Year == filterYear)
                .GroupBy(t => new { t.CategoryId, t.Category!.Name, t.Category.Color, t.Category.Icon })
                .Select(g => new
                {
                    categoryId = g.Key.CategoryId,
                    categoryName = g.Key.Name,
                    color = g.Key.Color,
                    icon = g.Key.Icon,
                    total = g.Sum(t => t.Amount),
                    count = g.Count()
                })
                .OrderByDescending(g => g.total)
                .Take(5)
                .ToListAsync();

            return Ok(data);
        }
    }
}


// ═══════════════════════════════════════════
// SETTINGS CONTROLLER
// ═══════════════════════════════════════════
namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly Microsoft.AspNetCore.Identity.UserManager<ApplicationUser> _userManager;

        public SettingsController(
            AppDbContext db,
            Microsoft.AspNetCore.Identity.UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/settings
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var user = await _userManager.FindByIdAsync(UserId);
            if (user == null) return NotFound();

            return Ok(new
            {
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                occupation = user.Occupation,
                dateOfBirth = user.DateOfBirth,
                currency = user.Currency,
                theme = user.Theme,
                createdAt = user.CreatedAt
            });
        }

        // PUT api/settings/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(UserId);
            if (user == null) return NotFound();

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Occupation = dto.Occupation;
            user.DateOfBirth = dto.DateOfBirth;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));

            return NoContent();
        }

        // PUT api/settings/preferences
        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] PreferencesDto dto)
        {
            var user = await _userManager.FindByIdAsync(UserId);
            if (user == null) return NotFound();

            user.Currency = dto.Currency;
            user.Theme = dto.Theme;

            await _userManager.UpdateAsync(user);
            return NoContent();
        }

        // PUT api/settings/password
        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(UserId);
            if (user == null) return NotFound();

            var result = await _userManager.ChangePasswordAsync(
                user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
                return BadRequest(new
                {
                    message = "Password change failed",
                    errors = result.Errors.Select(e => e.Description)
                });

            return NoContent();
        }

        // DELETE api/settings/account
        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var user = await _userManager.FindByIdAsync(UserId);
            if (user == null) return NotFound();

            // Delete all user data from the database
            var transactions = await _db.Transactions.Where(t => t.UserId == UserId).ToListAsync();
            _db.Transactions.RemoveRange(transactions);

            var categories = await _db.Categories.Where(c => c.UserId == UserId).ToListAsync();
            _db.Categories.RemoveRange(categories);

            var budgets = await _db.Budgets.Where(b => b.UserId == UserId).ToListAsync();
            _db.Budgets.RemoveRange(budgets);

            var savingsGoals = await _db.SavingsGoals.Where(s => s.UserId == UserId).ToListAsync();
            _db.SavingsGoals.RemoveRange(savingsGoals);

            var investments = await _db.Investments.Where(i => i.UserId == UserId).ToListAsync();
            _db.Investments.RemoveRange(investments);

            var debts = await _db.Debts.Where(d => d.UserId == UserId).ToListAsync();
            _db.Debts.RemoveRange(debts);

            var notifications = await _db.Notifications.Where(n => n.UserId == UserId).ToListAsync();
            _db.Notifications.RemoveRange(notifications);

            await _db.SaveChangesAsync();

            // Delete the user account
            var deleteResult = await _userManager.DeleteAsync(user);
            if (!deleteResult.Succeeded)
                return BadRequest(new
                {
                    message = "Account deletion failed",
                    errors = deleteResult.Errors.Select(e => e.Description)
                });

            return NoContent();
        }
    }

    public class ProfileDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string FirstName { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string LastName { get; set; } = "";
        public string? Occupation { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }

    public class PreferencesDto
    {
        public string Currency { get; set; } = "NGN";
        public string Theme { get; set; } = "dark";
    }

    public class ChangePasswordDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string CurrentPassword { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.MinLength(6)]
        public string NewPassword { get; set; } = "";
    }
}