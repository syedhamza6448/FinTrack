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
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public CategoriesController(AppDbContext db) => _db = db;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? type = null)
        {
            var query = _db.Categories
                .Where(c => c.UserId == UserId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(type))
                query = query.Where(c => c.Type == type);

            var items = await query
                .OrderBy(c => c.isDefault ? 0 : 1)
                .ThenBy(c => c.Name)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Type,
                    c.Icon,
                    c.Color,
                    c.isDefault
                })
                .ToListAsync();

            return Ok(items);
        }

        // GET api/categories/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var c = await _db.Categories
                .Where(c => c.Id == id && c.UserId == UserId)
                .Select(c => new { c.Id, c.Name, c.Type, c.Icon, c.Color, c.isDefault })
                .FirstOrDefaultAsync();

            if (c == null) return NotFound();
            return Ok(c);
        }

        // POST api/categories
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var category = new Category
            {
                UserId = UserId,
                Name = dto.Name,
                Type = dto.Type,
                Icon = dto.Icon,
                Color = dto.Color,
                isDefault = false
            };

            _db.Categories.Add(category);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, new { category.Id });
        }

        // PUT api/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryDto dto)
        {
            var category = await _db.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);

            if (category == null) return NotFound();

            category.Name = dto.Name;
            category.Type = dto.Type;
            category.Icon = dto.Icon;
            category.Color = dto.Color;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE api/categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _db.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == UserId);

            if (category == null) return NotFound();

            // Check if category is in use
            var inUse = await _db.Transactions.AnyAsync(t => t.CategoryId == id);
            if (inUse)
                return BadRequest(new { message = "Cannot delete category that has transactions." });

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    public class CategoryDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string Name { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string Type { get; set; } = ""; // "Income" or "Expense"
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}