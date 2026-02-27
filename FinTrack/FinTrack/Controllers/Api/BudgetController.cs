using FinTrack.Data;
using FinTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BudgetController : ControllerBase
    {
        private readonly AppDbContext _db;
        public BudgetController(AppDbContext db) => _db = db;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/budget?month=2026-02
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? month = null)
        {
            var now = DateTime.UtcNow;
            int filterMonth = now.Month;
            int filterYear = now.Year;

            if (!string.IsNullOrEmpty(month) &&
                DateTime.TryParse(month + "-01", out var parsed))
            {
                filterMonth = parsed.Month;
                filterYear = parsed.Year;
            }

            var budgets = await _db.Budgets
                .Include(b => b.Category)
                .Where(b => b.UserId == UserId &&
                            b.Month == filterMonth &&
                            b.Year == filterYear)
                .ToListAsync();

            // Calculate spent amount for each budget
            var result = new List<object>();
            foreach (var b in budgets)
            {
                var spent = await _db.Transactions
                    .Where(t => t.UserId == UserId &&
                                 t.CategoryId == b.CategoryId &&
                                 t.Type == "Expense" &&
                                 t.Date.Month == filterMonth &&
                                 t.Date.Year == filterYear)
                    .SumAsync(t => t.Amount);

                var percent = b.Amount > 0 ? Math.Round(spent / b.Amount * 100, 1) : 0;

                result.Add(new
                {
                    b.Id,
                    b.Amount,
                    b.Period,
                    b.Month,
                    b.Year,
                    spent,
                    remaining = b.Amount - spent,
                    percentUsed = percent,
                    status = percent >= 100 ? "exceeded" :
                                   percent >= 80 ? "warning" : "ok",
                    category = new
                    {
                        b.Category!.Id,
                        b.Category.Name,
                        b.Category.Icon,
                        b.Category.Color
                    }
                });
            }

            return Ok(result);
        }

        // GET api/budget/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var b = await _db.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == UserId);

            if (b == null) return NotFound();

            var spent = await _db.Transactions
                .Where(t => t.UserId == UserId &&
                             t.CategoryId == b.CategoryId &&
                             t.Type == "Expense" &&
                             t.Date.Month == b.Month &&
                             t.Date.Year == b.Year)
                .SumAsync(t => t.Amount);

            return Ok(new
            {
                b.Id,
                b.Amount,
                b.Period,
                b.Month,
                b.Year,
                spent,
                remaining = b.Amount - spent,
                percentUsed = b.Amount > 0 ? Math.Round(spent / b.Amount * 100, 1) : 0,
                category = new { b.Category!.Id, b.Category.Name, b.Category.Icon, b.Category.Color }
            });
        }

        // POST api/budget
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BudgetDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Prevent duplicate budget for same category+month+year
            var exists = await _db.Budgets.AnyAsync(b =>
                b.UserId == UserId &&
                b.CategoryId == dto.CategoryId &&
                b.Month == dto.Month &&
                b.Year == dto.Year);

            if (exists)
                return BadRequest(new { message = "A budget already exists for this category and period." });

            var budget = new Budget
            {
                UserId = UserId,
                CategoryId = dto.CategoryId,
                Amount = dto.Amount,
                Period = dto.Period,
                Month = dto.Month,
                Year = dto.Year
            };

            _db.Budgets.Add(budget);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = budget.Id }, new { budget.Id });
        }

        // PUT api/budget/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] BudgetDto dto)
        {
            var budget = await _db.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == UserId);

            if (budget == null) return NotFound();

            budget.Amount = dto.Amount;
            budget.Period = dto.Period;
            budget.CategoryId = dto.CategoryId;
            budget.Month = dto.Month;
            budget.Year = dto.Year;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/budget/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var budget = await _db.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == UserId);

            if (budget == null) return NotFound();

            _db.Budgets.Remove(budget);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // GET api/budget/overview  (total budget vs total spent this month)
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var now = DateTime.UtcNow;

            var budgets = await _db.Budgets
                .Where(b => b.UserId == UserId &&
                             b.Month == now.Month &&
                             b.Year == now.Year)
                .ToListAsync();

            var totalBudgeted = budgets.Sum(b => b.Amount);

            var totalSpent = await _db.Transactions
                .Where(t => t.UserId == UserId &&
                             t.Type == "Expense" &&
                             t.Date.Month == now.Month &&
                             t.Date.Year == now.Year)
                .SumAsync(t => t.Amount);

            return Ok(new
            {
                totalBudgeted,
                totalSpent,
                totalRemaining = totalBudgeted - totalSpent,
                percentUsed = totalBudgeted > 0
                    ? Math.Round(totalSpent / totalBudgeted * 100, 1)
                    : 0,
                budgetCount = budgets.Count
            });
        }
    }

    public class BudgetDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public int CategoryId { get; set; }
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.Range(1, double.MaxValue)]
        public decimal Amount { get; set; }
        public string Period { get; set; } = "Monthly";
        [System.ComponentModel.DataAnnotations.Range(1, 12)]
        public int Month { get; set; } = DateTime.UtcNow.Month;
        public int Year { get; set; } = DateTime.UtcNow.Year;
    }
}