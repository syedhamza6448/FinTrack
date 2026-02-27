using FinTrack.Data;
using FinTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

// ═══════════════════════════════════════════
// SAVINGS GOALS CONTROLLER
// ═══════════════════════════════════════════
namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SavingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public SavingsController(AppDbContext db) => _db = db;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/savings
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null)
        {
            var query = _db.SavingsGoals
                .Where(s => s.UserId == UserId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(s => s.Status == status);

            var items = await query
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.TargetAmount,
                    s.SavedAmount,
                    s.TargetDate,
                    s.Status,
                    s.Icon,
                    s.Color,
                    s.CreatedAt,
                    progressPercent = s.TargetAmount > 0
                        ? Math.Round(s.SavedAmount / s.TargetAmount * 100, 1)
                        : 0,
                    remaining = s.TargetAmount - s.SavedAmount
                })
                .ToListAsync();

            return Ok(items);
        }

        // GET api/savings/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var s = await _db.SavingsGoals
                .Where(s => s.Id == id && s.UserId == UserId)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.TargetAmount,
                    s.SavedAmount,
                    s.TargetDate,
                    s.Status,
                    s.Icon,
                    s.Color,
                    s.CreatedAt,
                    progressPercent = s.TargetAmount > 0
                        ? Math.Round(s.SavedAmount / s.TargetAmount * 100, 1)
                        : 0,
                    remaining = s.TargetAmount - s.SavedAmount
                })
                .FirstOrDefaultAsync();

            if (s == null) return NotFound();
            return Ok(s);
        }

        // POST api/savings
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SavingsGoalDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var goal = new SavingsGoal
            {
                UserId = UserId,
                Name = dto.Name,
                TargetAmount = dto.TargetAmount,
                SavedAmount = dto.SavedAmount,
                TargetDate = dto.TargetDate,
                Status = "Active",
                Icon = dto.Icon,
                Color = dto.Color
            };

            _db.SavingsGoals.Add(goal);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = goal.Id }, new { goal.Id });
        }

        // PUT api/savings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SavingsGoalDto dto)
        {
            var goal = await _db.SavingsGoals
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId);

            if (goal == null) return NotFound();

            goal.Name = dto.Name;
            goal.TargetAmount = dto.TargetAmount;
            goal.SavedAmount = dto.SavedAmount;
            goal.TargetDate = dto.TargetDate;
            goal.Icon = dto.Icon;
            goal.Color = dto.Color;

            // Auto-complete if target reached
            if (goal.SavedAmount >= goal.TargetAmount)
                goal.Status = "Completed";
            else if (!string.IsNullOrEmpty(dto.Status))
                goal.Status = dto.Status;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // PATCH api/savings/5/deposit  (add money to a goal quickly)
        [HttpPatch("{id}/deposit")]
        public async Task<IActionResult> Deposit(int id, [FromBody] DepositDto dto)
        {
            var goal = await _db.SavingsGoals
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId);

            if (goal == null) return NotFound();

            goal.SavedAmount += dto.Amount;
            if (goal.SavedAmount >= goal.TargetAmount) goal.Status = "Completed";

            await _db.SaveChangesAsync();
            return Ok(new
            {
                savedAmount = goal.SavedAmount,
                progressPercent = Math.Round(goal.SavedAmount / goal.TargetAmount * 100, 1),
                status = goal.Status
            });
        }

        // DELETE api/savings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var goal = await _db.SavingsGoals
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId);

            if (goal == null) return NotFound();
            _db.SavingsGoals.Remove(goal);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public class SavingsGoalDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Name { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public decimal TargetAmount { get; set; }
        public decimal SavedAmount { get; set; }
        public DateTime? TargetDate { get; set; }
        public string? Status { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }

    public class DepositDto
    {
        [System.ComponentModel.DataAnnotations.Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
    }
}


// ═══════════════════════════════════════════
// INVESTMENTS CONTROLLER
// ═══════════════════════════════════════════
namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InvestmentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public InvestmentsController(AppDbContext db) => _db = db;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/investments
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? assetType = null)
        {
            var query = _db.Investments
                .Where(i => i.UserId == UserId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(assetType))
                query = query.Where(i => i.AssetType == assetType);

            var items = await query
                .OrderByDescending(i => i.PurchaseDate)
                .ToListAsync();

            var result = items.Select(i => new
            {
                i.Id,
                i.Name,
                i.Ticker,
                i.AssetType,
                i.Quantity,
                i.BuyPrice,
                i.CurrentPrice,
                i.PurchaseDate,
                i.DividendEarned,
                i.UpdatedAt,
                totalValue = i.Quantity * i.CurrentPrice,
                totalCost = i.Quantity * i.BuyPrice,
                gainLoss = (i.CurrentPrice - i.BuyPrice) * i.Quantity,
                gainLossPct = i.BuyPrice > 0
                    ? Math.Round((i.CurrentPrice - i.BuyPrice) / i.BuyPrice * 100, 2)
                    : 0
            });

            // Portfolio summary
            var totalValue = items.Sum(i => i.Quantity * i.CurrentPrice);
            var totalCost = items.Sum(i => i.Quantity * i.BuyPrice);
            var totalGainLoss = totalValue - totalCost;

            return Ok(new
            {
                items = result,
                summary = new
                {
                    totalValue,
                    totalCost,
                    totalGainLoss,
                    totalGainLossPct = totalCost > 0
                        ? Math.Round(totalGainLoss / totalCost * 100, 2)
                        : 0,
                    totalDividends = items.Sum(i => i.DividendEarned ?? 0)
                }
            });
        }

        // GET api/investments/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var i = await _db.Investments
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == UserId);

            if (i == null) return NotFound();

            return Ok(new
            {
                i.Id,
                i.Name,
                i.Ticker,
                i.AssetType,
                i.Quantity,
                i.BuyPrice,
                i.CurrentPrice,
                i.PurchaseDate,
                i.DividendEarned,
                i.UpdatedAt,
                totalValue = i.Quantity * i.CurrentPrice,
                gainLoss = (i.CurrentPrice - i.BuyPrice) * i.Quantity,
                gainLossPct = i.BuyPrice > 0
                    ? Math.Round((i.CurrentPrice - i.BuyPrice) / i.BuyPrice * 100, 2)
                    : 0
            });
        }

        // POST api/investments
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InvestmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var investment = new Investment
            {
                UserId = UserId,
                Name = dto.Name,
                Ticker = dto.Ticker,
                AssetType = dto.AssetType,
                Quantity = dto.Quantity,
                BuyPrice = dto.BuyPrice,
                CurrentPrice = dto.CurrentPrice,
                PurchaseDate = dto.PurchaseDate,
                DividendEarned = dto.DividendEarned,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Investments.Add(investment);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = investment.Id }, new { investment.Id });
        }

        // PUT api/investments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InvestmentDto dto)
        {
            var inv = await _db.Investments
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == UserId);

            if (inv == null) return NotFound();

            inv.Name = dto.Name;
            inv.Ticker = dto.Ticker;
            inv.AssetType = dto.AssetType;
            inv.Quantity = dto.Quantity;
            inv.BuyPrice = dto.BuyPrice;
            inv.CurrentPrice = dto.CurrentPrice;
            inv.PurchaseDate = dto.PurchaseDate;
            inv.DividendEarned = dto.DividendEarned;
            inv.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/investments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var inv = await _db.Investments
                .FirstOrDefaultAsync(i => i.Id == id && i.UserId == UserId);

            if (inv == null) return NotFound();
            _db.Investments.Remove(inv);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public class InvestmentDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Name { get; set; } = "";
        public string Ticker { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string AssetType { get; set; } = ""; // Stock, Bond, Real Estate, Cash
        public decimal Quantity { get; set; }
        public decimal BuyPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public DateTime PurchaseDate { get; set; }
        public decimal? DividendEarned { get; set; }
    }
}


// ═══════════════════════════════════════════
// DEBT CONTROLLER
// ═══════════════════════════════════════════
namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DebtController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DebtController(AppDbContext db) => _db = db;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/debt
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? priority = null)
        {
            var query = _db.Debts
                .Where(d => d.UserId == UserId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(d => d.Priority == priority);

            var items = await query
                .OrderByDescending(d => d.Priority == "High" ? 3 :
                                        d.Priority == "Medium" ? 2 : 1)
                .ToListAsync();

            var result = items.Select(d => new
            {
                d.Id,
                d.Name,
                d.DebtType,
                d.OriginalAmount,
                d.RemainingBalance,
                d.MonthlyPayment,
                d.InterestRate,
                d.StartDate,
                d.ExpectedPayoffDate,
                d.Priority,
                d.UpdatedAt,
                paidOff = d.OriginalAmount - d.RemainingBalance,
                paidOffPct = d.OriginalAmount > 0
                    ? Math.Round((d.OriginalAmount - d.RemainingBalance) / d.OriginalAmount * 100, 1)
                    : 0,
                totalInterestEstimate = d.RemainingBalance * (d.InterestRate / 100)
            });

            var totalDebt = items.Sum(d => d.RemainingBalance);
            var totalMonthlyPayment = items.Sum(d => d.MonthlyPayment);

            return Ok(new
            {
                items = result,
                summary = new { totalDebt, totalMonthlyPayment, debtCount = items.Count }
            });
        }

        // GET api/debt/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var d = await _db.Debts
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);

            if (d == null) return NotFound();
            return Ok(d);
        }

        // POST api/debt
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DebtDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var debt = new Debt
            {
                UserId = UserId,
                Name = dto.Name,
                DebtType = dto.DebtType,
                OriginalAmount = dto.OriginalAmount,
                RemainingBalance = dto.RemainingBalance,
                MonthlyPayment = dto.MonthlyPayment,
                InterestRate = dto.InterestRate,
                StartDate = dto.StartDate,
                ExpectedPayoffDate = dto.ExpectedPayoffDate ?? DateTime.UtcNow.AddYears(5),
                Priority = dto.Priority,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Debts.Add(debt);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = debt.Id }, new { debt.Id });
        }

        // PUT api/debt/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] DebtDto dto)
        {
            var debt = await _db.Debts
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);

            if (debt == null) return NotFound();

            debt.Name = dto.Name;
            debt.DebtType = dto.DebtType;
            debt.OriginalAmount = dto.OriginalAmount;
            debt.RemainingBalance = dto.RemainingBalance;
            debt.MonthlyPayment = dto.MonthlyPayment;
            debt.InterestRate = dto.InterestRate;
            debt.StartDate = dto.StartDate;
            debt.ExpectedPayoffDate = dto.ExpectedPayoffDate ?? debt.ExpectedPayoffDate;
            debt.Priority = dto.Priority;
            debt.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // PATCH api/debt/5/payment  (record a payment — reduces balance)
        [HttpPatch("{id}/payment")]
        public async Task<IActionResult> RecordPayment(int id, [FromBody] DepositDto dto)
        {
            var debt = await _db.Debts
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);

            if (debt == null) return NotFound();

            debt.RemainingBalance = Math.Max(0, debt.RemainingBalance - dto.Amount);
            debt.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                remainingBalance = debt.RemainingBalance,
                paidOffPct = Math.Round(
                    (debt.OriginalAmount - debt.RemainingBalance) / debt.OriginalAmount * 100, 1)
            });
        }

        // DELETE api/debt/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var debt = await _db.Debts
                .FirstOrDefaultAsync(d => d.Id == id && d.UserId == UserId);

            if (debt == null) return NotFound();
            _db.Debts.Remove(debt);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public class DebtDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Name { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string DebtType { get; set; } = ""; // Mortgage, StudentLoan, CreditCard, Personal
        public decimal OriginalAmount { get; set; }
        public decimal RemainingBalance { get; set; }
        public decimal MonthlyPayment { get; set; }
        public decimal InterestRate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? ExpectedPayoffDate { get; set; }
        public string Priority { get; set; } = "Medium"; // High, Medium, Low
    }
}