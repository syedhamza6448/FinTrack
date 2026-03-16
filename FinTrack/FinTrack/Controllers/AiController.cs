using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using FinTrack.Data;
using FinTrack.Models;
using FinTrack.Services;

namespace FinTrack.Controllers
{
    [ApiController]
    [Route("api/ai")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly GeminiService _gemini;
        private readonly AppDbContext _db;

        public AiController(GeminiService gemini, AppDbContext db)
        {
            _gemini = gemini;
            _db = db;
        }

        // ── Helper: get current user's ID as string from JWT ─────
        private string GetUserId()
        {
            var claim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            return claim!.Value;
        }

        // ════════════════════════════════════════════════════════
        // FEATURE 5 — AI Chat Assistant
        // POST /api/ai/chat
        // ════════════════════════════════════════════════════════
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Message))
                return BadRequest(new { error = "Message cannot be empty." });

            var userId = GetUserId();

            // ── Minimal context to save tokens ───────────────────
            var totalIncome = await _db.Transactions
                .Where(t => t.UserId == userId && t.Type == "Income")
                .SumAsync(t => t.Amount);

            var totalExpenses = await _db.Transactions
                .Where(t => t.UserId == userId && t.Type == "Expense")
                .SumAsync(t => t.Amount);

            // Only last 5 transactions
            var recentTransactions = await _db.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .OrderByDescending(t => t.Date)
                .Take(5)
                .Select(t => t.Date + ": " + t.Type + " - " + t.Category.Name + " - " + t.Amount.ToString("N2") + " (" + t.Description + ")")
                .ToListAsync();

            // Only last 3 history messages to save tokens
            var recentHistory = req.History != null && req.History.Count > 0
                ? req.History.TakeLast(3).ToList()
                : new List<ChatMessage>();

            var historyText = recentHistory.Count > 0
                ? string.Join("\n", recentHistory.Select(h => h.Role.ToUpper() + ": " + h.Text))
                : "";

            var txnText = recentTransactions.Count > 0
                ? string.Join("\n", recentTransactions)
                : "No transactions yet.";

            var prompt = $$"""
                You are FinTrack AI, a personal finance assistant. Plain text only. Under 100 words.

                User finances: Income USD{{totalIncome:N2}}, Expenses USD{{totalExpenses:N2}}
                Recent transactions:
                {{txnText}}
                {{(historyText.Length > 0 ? "History:\n" + historyText : "")}}
                USER: {{req.Message}}
                FINTRACK AI:
                """;

            var reply = await _gemini.AskAsync(prompt);
            return Ok(new { reply });
        }

        // ════════════════════════════════════════════════════════
        // FEATURE 6 — Natural Language Transaction Entry
        // POST /api/ai/parse-transaction
        // Body: { "text": "Spent 3500 on groceries yesterday" }
        // ════════════════════════════════════════════════════════
        [HttpPost("parse-transaction")]
        public async Task<IActionResult> ParseTransaction([FromBody] ParseTransactionRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Text))
                return BadRequest(new { error = "Text cannot be empty." });

            var userId = GetUserId();

            var categories = await _db.Categories
                .Where(c => c.UserId == userId)
                .Select(c => c.Name + "(" + c.Type + ")")
                .ToListAsync();

            var categoryList = string.Join(",", categories);
            var todayStr = DateTime.Now.ToString("yyyy-MM-dd");
            var yesterdayStr = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd");

            var prompt = $$"""
                Parse this into a transaction JSON. Categories: {{categoryList}}
                Today: {{todayStr}}, Yesterday: {{yesterdayStr}}
                Input: "{{req.Text}}"
                spending/paying/bought=Expense, received/earned/salary=Income
                Respond ONLY with JSON, no markdown:
                {"amount":0.00,"type":"Expense","category":"name","description":"text","date":"YYYY-MM-DD"}
                """;

            var result = await _gemini.AskAsync(prompt);
            result = result.Replace("```json", "").Replace("```", "").Trim();

            try
            {
                var parsed = JsonSerializer.Deserialize<ParsedTransaction>(result, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return Ok(parsed);
            }
            catch
            {
                return BadRequest(new { error = "Could not parse the transaction. Please try rephrasing." });
            }
        }

        // ════════════════════════════════════════════════════════
        // FEATURE 11 — Smart Notification Generator
        // POST /api/ai/smart-notification
        // Body: { "category", "amountSpent", "budgetLimit", "utilisationPct", "status" }
        // ════════════════════════════════════════════════════════
        [HttpPost("smart-notification")]
        public async Task<IActionResult> GenerateSmartNotification([FromBody] SmartNotifRequest req)
        {
            var prompt = $$"""
                Write a 1-2 sentence finance notification. No markdown, no emojis.
                Category: {{req.Category}}, Spent: {{req.AmountSpent:N2}}, Budget: {{req.BudgetLimit:N2}}, Usage: {{req.UtilisationPct}}%, Status: {{req.Status}}
                Notification text only:
                """;

            var message = await _gemini.AskAsync(prompt);
            message = message.Trim();

            var title = req.Status == "EXCEEDED"
                ? req.Category + " Budget Exceeded"
                : req.Category + " Budget Warning";

            return Ok(new { title, message });
        }

        // ════════════════════════════════════════════════════════
        // FEATURE 12 — Monthly AI Financial Report
        // GET /api/ai/monthly-report?month=3&year=2026
        // ════════════════════════════════════════════════════════
        [HttpGet("monthly-report")]
        public async Task<IActionResult> MonthlyReport([FromQuery] int month, [FromQuery] int year)
        {
            if (month < 1 || month > 12)
                return BadRequest(new { error = "Invalid month. Must be between 1 and 12." });

            if (year < 2000 || year > 2100)
                return BadRequest(new { error = "Invalid year." });

            var userId = GetUserId();

            var transactions = await _db.Transactions
                .Where(t => t.UserId == userId && t.Date.Month == month && t.Date.Year == year)
                .Include(t => t.Category)
                .ToListAsync();

            var totalIncome = transactions.Where(t => t.Type == "Income").Sum(t => t.Amount);
            var totalExpenses = transactions.Where(t => t.Type == "Expense").Sum(t => t.Amount);
            var netSavings = totalIncome - totalExpenses;
            var savingsRate = totalIncome > 0 ? Math.Round((netSavings / totalIncome) * 100, 1) : 0;

            // Top 5 expense categories only to save tokens
            var byCategory = transactions
                .Where(t => t.Type == "Expense")
                .GroupBy(t => t.Category.Name)
                .OrderByDescending(g => g.Sum(t => t.Amount))
                .Take(5)
                .Select(g => g.Key + ":" + g.Sum(t => t.Amount).ToString("N2"))
                .ToList();

            var budgets = await _db.Budgets
                .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
                .Include(b => b.Category)
                .ToListAsync();

            var budgetSummary = budgets.Select(b =>
            {
                var spent = transactions
                    .Where(t => t.CategoryId == b.CategoryId && t.Type == "Expense")
                    .Sum(t => t.Amount);
                var pct = b.Amount > 0 ? Math.Round((spent / b.Amount) * 100, 1) : 0;
                var status = pct >= 100 ? "EXCEEDED" : pct >= 80 ? "WARNING" : "OK";
                return b.Category.Name + ":" + pct + "%-" + status;
            }).ToList();

            var monthName = new DateTime(year, month, 1).ToString("MMMM yyyy");
            var byCatText = byCategory.Count > 0 ? string.Join(", ", byCategory) : "none";
            var budgetText = budgetSummary.Count > 0 ? string.Join(", ", budgetSummary) : "none";

            var prompt = $$"""
                Write a 4-paragraph monthly finance report. Plain English, no markdown, no bullets.
                Para 1: income/expenses/savings summary. Para 2: what went well. Para 3: what needs improvement. Para 4: one tip for next month.

                Data for {{monthName}}:
                Income:{{totalIncome:N2}} Expenses:{{totalExpenses:N2}} Net:{{netSavings:N2}} SavingsRate:{{savingsRate}}%
                Top spending: {{byCatText}}
                Budgets: {{budgetText}}
                """;

            var report = await _gemini.AskAsync(prompt);
            return Ok(new { month = monthName, report = report.Trim() });
        }

        // ════════════════════════════════════════════════════════
        // FEATURE 13 — Receipt / Bill Scanner
        // POST /api/ai/scan-receipt
        // Form: file (image/jpeg, image/png, image/webp, application/pdf)
        // ════════════════════════════════════════════════════════
        [HttpPost("scan-receipt")]
        public IActionResult ScanReceipt(IFormFile file)
        {
            return StatusCode(503, new
            {
                error = "Receipt scanning is temporarily unavailable. Please use the natural language input instead — try typing 'Spent 5000 at Shoprite today'."
            });
        }
        //[HttpPost("scan-receipt")]
        //public async Task<IActionResult> ScanReceipt(IFormFile file)
        //{
        //    if (file == null || file.Length == 0)
        //        return BadRequest(new { error = "No file uploaded." });

        //    var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        //    if (!allowedTypes.Contains(file.ContentType.ToLower()))
        //        return BadRequest(new { error = "Unsupported file type. Please upload a JPG, PNG, WebP, or PDF." });

        //    if (file.Length > 2 * 1024 * 1024)
        //        return BadRequest(new { error = "File too large. Maximum size is 2MB." });

        //    var userId = GetUserId();

        //    using var ms = new MemoryStream();
        //    await file.CopyToAsync(ms);
        //    var bytes = ms.ToArray();

        //    var categories = await _db.Categories
        //        .Where(c => c.UserId == userId)
        //        .Select(c => c.Name)
        //        .ToListAsync();

        //    var categoryList = string.Join(",", categories);
        //    var todayStr = DateTime.Now.ToString("yyyy-MM-dd");

        //    var prompt = $$"""
        //        Extract transaction from this receipt. Categories: {{categoryList}} Today: {{todayStr}}
        //        Amount=total paid, Type=Expense unless payment received, Description=merchant name under 60 chars, Date=receipt date or today.
        //        Respond ONLY with JSON, no markdown:
        //        {"amount":0.00,"type":"Expense","category":"name","description":"text","date":"YYYY-MM-DD"}
        //        """;

        //    var result = await _gemini.AskWithImageAsync(prompt, bytes, file.ContentType);
        //    result = result.Replace("```json", "").Replace("```", "").Trim();

        //    try
        //    {
        //        var parsed = JsonSerializer.Deserialize<ParsedTransaction>(result, new JsonSerializerOptions
        //        {
        //            PropertyNameCaseInsensitive = true
        //        });
        //        return Ok(parsed);
        //    }
        //    catch
        //    {
        //        return BadRequest(new { error = "Could not read the receipt. Please try a clearer image." });
        //    }
        //}

        // ════════════════════════════════════════════════════════
        // FEATURE 14 — Bank Statement Parser
        // POST /api/ai/parse-statement
        // Form: file (image or PDF of bank statement)
        // ════════════════════════════════════════════════════════
        [HttpPost("parse-statement")]
        public IActionResult ParseStatement(IFormFile file)
        {
            return StatusCode(503, new
            {
                error = "Bank statement import is temporarily unavailable. Please add transactions manually or use the natural language input."
            });
        }
        //[HttpPost("parse-statement")]
        //public async Task<IActionResult> ParseStatement(IFormFile file)
        //{
        //    if (file == null || file.Length == 0)
        //        return BadRequest(new { error = "No file uploaded." });

        //    var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        //    if (!allowedTypes.Contains(file.ContentType.ToLower()))
        //        return BadRequest(new { error = "Unsupported file type. Please upload a JPG, PNG, WebP, or PDF." });

        //    if (file.Length > 20 * 1024 * 1024)
        //        return BadRequest(new { error = "File too large. Maximum size is 20MB." });

        //    var userId = GetUserId();

        //    using var ms = new MemoryStream();
        //    await file.CopyToAsync(ms);
        //    var bytes = ms.ToArray();

        //    var categories = await _db.Categories
        //        .Where(c => c.UserId == userId)
        //        .Select(c => c.Name)
        //        .ToListAsync();

        //    var categoryList = string.Join(",", categories);
        //    var todayStr = DateTime.Now.ToString("yyyy-MM-dd");

        //    var prompt = $$"""
        //        Extract all transactions from this bank statement. Categories: {{categoryList}} Today: {{todayStr}}
        //        Debits=Expense, Credits=Income. Skip balance rows. Amount=positive number. Date=YYYY-MM-DD.
        //        Respond ONLY with a JSON array, no markdown:
        //        [{"amount":0.00,"type":"Expense","category":"name","description":"text","date":"YYYY-MM-DD"}]
        //        Return [] if none found.
        //        """;

        //    var result = await _gemini.AskWithImageAsync(prompt, bytes, file.ContentType);
        //    result = result.Replace("```json", "").Replace("```", "").Trim();

        //    try
        //    {
        //        var transactions = JsonSerializer.Deserialize<List<ParsedTransaction>>(result, new JsonSerializerOptions
        //        {
        //            PropertyNameCaseInsensitive = true
        //        }) ?? new List<ParsedTransaction>();

        //        return Ok(new
        //        {
        //            transactions,
        //            count = transactions.Count,
        //            message = transactions.Count == 0
        //                ? "No transactions could be extracted. Try a clearer image."
        //                : "Found " + transactions.Count + " transaction(s). Review and confirm before importing."
        //        });
        //    }
        //    catch
        //    {
        //        return BadRequest(new { error = "Could not parse the bank statement. Please try a clearer image or PDF." });
        //    }
        //}
    }

    // ════════════════════════════════════════════════════════
    // REQUEST / RESPONSE MODELS
    // ════════════════════════════════════════════════════════

    // Feature 5 — Chat
    public record ChatRequest(string Message, List<ChatMessage>? History);
    public record ChatMessage(string Role, string Text);

    // Feature 6 — Natural Language Parse
    public record ParseTransactionRequest(string Text);

    // Feature 11 — Smart Notification
    public record SmartNotifRequest(
        string Category,
        decimal AmountSpent,
        decimal BudgetLimit,
        int UtilisationPct,
        string Status       // "WARNING" or "EXCEEDED"
    );

    // Shared parsed transaction shape (Features 6, 13, 14)
    public record ParsedTransaction(
        decimal Amount,
        string Type,
        string Category,
        string Description,
        string Date
    );
}