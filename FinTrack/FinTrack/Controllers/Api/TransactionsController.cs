using FinTrack.Data;
using FinTrack.Models;
using FinTrack.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly GeminiService _gemini;

        public TransactionsController(AppDbContext db, GeminiService gemini)
        {
            _db = db;
            _gemini = gemini;
        }

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/transactions?page=1&pageSize=20&type=Expense&categoryId=3&search=coffee
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? type = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] string? search = null,
            [FromQuery] string? month = null)
        {
            var query = _db.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == UserId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(type))
                query = query.Where(t => t.Type == type);

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId.Value);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(t => t.Description.Contains(search) ||
                                         (t.Notes != null && t.Notes.Contains(search)));

            if (!string.IsNullOrEmpty(month) &&
                DateTime.TryParse(month + "-01", out var monthDate))
            {
                var startDate = new DateTime(monthDate.Year, monthDate.Month, 1);
                var endDate = startDate.AddMonths(1);
                query = query.Where(t => t.Date >= startDate && t.Date < endDate);
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(t => t.Date)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new
                {
                    t.Id,
                    t.Description,
                    t.Amount,
                    t.Type,
                    t.Date,
                    t.Notes,
                    t.CreatedAt,
                    category = new { t.Category!.Id, t.Category.Name, t.Category.Icon, t.Category.Color }
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        // GET api/transactions/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var t = await _db.Transactions
                .Include(t => t.Category)
                .Where(t => t.Id == id && t.UserId == UserId)
                .Select(t => new
                {
                    t.Id,
                    t.Description,
                    t.Amount,
                    t.Type,
                    t.Date,
                    t.Notes,
                    t.CategoryId,
                    t.CreatedAt,
                    category = new { t.Category!.Id, t.Category.Name, t.Category.Icon, t.Category.Color }
                })
                .FirstOrDefaultAsync();

            if (t == null) return NotFound();
            return Ok(t);
        }

        // POST api/transactions
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TransactionCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var transaction = new Transaction
            {
                UserId = UserId,
                CategoryId = dto.CategoryId,
                Description = dto.Description,
                Amount = dto.Amount,
                Type = dto.Type,
                Date = dto.Date,
                Notes = dto.Notes
            };

            _db.Transactions.Add(transaction);
            await _db.SaveChangesAsync();

            // ── Feature 11: AI Smart Notification on budget threshold ──
            await CheckBudgetAlert(transaction);

            return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, new { transaction.Id });
        }

        // PUT api/transactions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TransactionCreateDto dto)
        {
            var transaction = await _db.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);

            if (transaction == null) return NotFound();

            transaction.CategoryId = dto.CategoryId;
            transaction.Description = dto.Description;
            transaction.Amount = dto.Amount;
            transaction.Type = dto.Type;
            transaction.Date = dto.Date;
            transaction.Notes = dto.Notes;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/transactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var transaction = await _db.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == UserId);

            if (transaction == null) return NotFound();

            _db.Transactions.Remove(transaction);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET api/transactions/summary  (for dashboard)
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] string? month = null)
        {
            var query = _db.Transactions.Where(t => t.UserId == UserId);

            if (!string.IsNullOrEmpty(month) &&
                DateTime.TryParse(month + "-01", out var monthDate))
            {
                var startDate = new DateTime(monthDate.Year, monthDate.Month, 1);
                var endDate = startDate.AddMonths(1);
                query = query.Where(t => t.Date >= startDate && t.Date < endDate);
            }

            var totalIncome = await query.Where(t => t.Type == "Income").SumAsync(t => t.Amount);
            var totalExpense = await query.Where(t => t.Type == "Expense").SumAsync(t => t.Amount);

            return Ok(new
            {
                totalIncome,
                totalExpense,
                netBalance = totalIncome - totalExpense,
                savingsRate = totalIncome > 0
                    ? Math.Round((totalIncome - totalExpense) / totalIncome * 100, 1)
                    : 0
            });
        }

        // ════════════════════════════════════════════════════════
        // FEATURE 11 — AI Smart Notification
        // Triggered automatically after every expense transaction.
        // Fires at 80% (WARNING) and 100%+ (EXCEEDED) of budget.
        // Only one notification per category per month per threshold.
        // ════════════════════════════════════════════════════════
        private async Task CheckBudgetAlert(Transaction t)
        {
            // Only check expense transactions
            if (t.Type != "Expense") return;

            // Find matching budget for this category + month
            var budget = await _db.Budgets
                .FirstOrDefaultAsync(b =>
                    b.UserId == UserId &&
                    b.CategoryId == t.CategoryId &&
                    b.Month == t.Date.Month &&
                    b.Year == t.Date.Year);

            if (budget == null) return;

            // Calculate total spent this month for this category
            var spentStart = new DateTime(t.Date.Year, t.Date.Month, 1);
            var spentEnd = spentStart.AddMonths(1);
            var spent = await _db.Transactions
                .Where(x =>
                    x.UserId == UserId &&
                    x.CategoryId == t.CategoryId &&
                    x.Type == "Expense" &&
                    x.Date >= spentStart &&
                    x.Date < spentEnd)
                .SumAsync(x => x.Amount);

            var utilisationPct = (int)Math.Round(spent / budget.Amount * 100);

            // Determine which threshold was crossed
            string? status = null;
            if (utilisationPct >= 100) status = "EXCEEDED";
            else if (utilisationPct >= 80) status = "WARNING";

            if (status == null) return;

            // Load the category name
            var category = await _db.Categories.FindAsync(t.CategoryId);
            if (category == null) return;

            // Prevent duplicate notifications — one per category per month per status
            var notifStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var notifEnd = notifStart.AddMonths(1);
            var statusKeyword = status == "EXCEEDED" ? "Exceeded" : "Warning";
            var alreadyNotified = await _db.Notifications
                .AnyAsync(n =>
                    n.UserId == UserId &&
                    n.Type == "Alert" &&
                    n.CreatedAt >= notifStart &&
                    n.CreatedAt < notifEnd &&
                    n.Title.Contains(category.Name) &&
                    n.Title.Contains(statusKeyword));

            if (alreadyNotified) return;

            // ── Generate AI notification message ─────────────────
            string title;
            string message;

            try
            {
                var aiRequest = new SmartNotifRequest(
                    Category: category.Name,
                    AmountSpent: spent,
                    BudgetLimit: budget.Amount,
                    UtilisationPct: utilisationPct,
                    Status: status
                );

                var prompt = $$"""
                    Write a 1-2 sentence finance notification. No markdown, no emojis.
                    Category: {{aiRequest.Category}}, Spent: {{aiRequest.AmountSpent:N2}}, Budget: {{aiRequest.BudgetLimit:N2}}, Usage: {{aiRequest.UtilisationPct}}%, Status: {{aiRequest.Status}}
                    Notification text only:
                    """;

                message = (await _gemini.AskAsync(prompt)).Trim();
                title = status == "EXCEEDED"
                    ? $"{category.Name} Budget Exceeded"
                    : $"{category.Name} Budget Warning";
            }
            catch
            {
                // Fallback to plain message if AI call fails —
                // transaction save must never fail because of notification errors
                title = status == "EXCEEDED"
                    ? $"{category.Name} Budget Exceeded"
                    : $"{category.Name} Budget Warning";
                message = status == "EXCEEDED"
                    ? $"You've exceeded your {category.Name} budget — spent {spent:N2} of {budget.Amount:N2}."
                    : $"You've used {utilisationPct}% of your {category.Name} budget this month ({spent:N2} of {budget.Amount:N2}).";
            }

            // Save notification to database
            _db.Notifications.Add(new Notification
            {
                UserId = UserId,
                Title = title,
                Message = message,
                Type = "Alert"
            });

            await _db.SaveChangesAsync();
        }
    }

    public class TransactionCreateDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public int CategoryId { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string Description { get; set; } = "";

        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [System.ComponentModel.DataAnnotations.Required]
        public string Type { get; set; } = "";

        [System.ComponentModel.DataAnnotations.Required]
        public DateTime Date { get; set; }

        public string? Notes { get; set; }
    }
}