using FinTrack.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FinTrack.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _config;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration config)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _config = config;
        }

        // POST api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Currency = dto.Currency ?? "NGN",
                Theme = "dark"
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Registration failed",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            // Seed default categories for the new user
            await SeedDefaultCategories(user.Id);

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email!,
                FullName = $"{user.FirstName} {user.LastName}",
                Currency = user.Currency,
                Theme = user.Theme,
                ExpiresAt = DateTime.UtcNow.AddHours(
                    _config.GetValue<int>("Jwt:ExpiresInHours", 24))
            });
        }

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded)
                return Unauthorized(new { message = "Invalid email or password" });

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email!,
                FullName = $"{user.FirstName} {user.LastName}",
                Currency = user.Currency,
                Theme = user.Theme,
                ExpiresAt = DateTime.UtcNow.AddHours(
                    _config.GetValue<int>("Jwt:ExpiresInHours", 24))
            });
        }

        // GET api/auth/me  (returns current user info from token)
        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId!);
            if (user == null) return NotFound();

            return Ok(new
            {
                email = user.Email,
                fullName = $"{user.FirstName} {user.LastName}",
                firstName = user.FirstName,
                lastName = user.LastName,
                currency = user.Currency,
                theme = user.Theme,
                occupation = user.Occupation,
                createdAt = user.CreatedAt
            });
        }

        // ─── Helper: generate JWT ───────────────────────────────────
        private string GenerateJwtToken(ApplicationUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiry = DateTime.UtcNow.AddHours(_config.GetValue<int>("Jwt:ExpiresInHours", 24));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email,          user.Email!),
                new Claim(ClaimTypes.Name,           $"{user.FirstName} {user.LastName}"),
                new Claim("currency",                user.Currency),
                new Claim("theme",                   user.Theme)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ─── Helper: seed default categories for new user ───────────
        private async Task SeedDefaultCategories(string userId)
        {
            // Injecting DbContext here instead of in constructor
            // to avoid issues with scoped services
            using var scope = HttpContext.RequestServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<FinTrack.Data.AppDbContext>();

            var defaults = new[]
            {
                new Category { UserId = userId, Name = "Salary",        Type = "Income",  Icon = "💼", Color = "#3ecf8e", isDefault = true },
                new Category { UserId = userId, Name = "Freelance",     Type = "Income",  Icon = "💻", Color = "#5b9cf6", isDefault = true },
                new Category { UserId = userId, Name = "Food & Dining", Type = "Expense", Icon = "🍽️", Color = "#f5a623", isDefault = true },
                new Category { UserId = userId, Name = "Transport",     Type = "Expense", Icon = "🚗", Color = "#5b9cf6", isDefault = true },
                new Category { UserId = userId, Name = "Housing",       Type = "Expense", Icon = "🏠", Color = "#a78bfa", isDefault = true },
                new Category { UserId = userId, Name = "Healthcare",    Type = "Expense", Icon = "🏥", Color = "#f25c6e", isDefault = true },
                new Category { UserId = userId, Name = "Entertainment", Type = "Expense", Icon = "🎬", Color = "#f5a623", isDefault = true },
                new Category { UserId = userId, Name = "Shopping",      Type = "Expense", Icon = "🛍️", Color = "#a78bfa", isDefault = true },
                new Category { UserId = userId, Name = "Education",     Type = "Expense", Icon = "📚", Color = "#5b9cf6", isDefault = true },
                new Category { UserId = userId, Name = "Savings",       Type = "Expense", Icon = "💰", Color = "#3ecf8e", isDefault = true },
            };

            db.Categories.AddRange(defaults);
            await db.SaveChangesAsync();
        }
    }

    // ─── DTOs ───────────────────────────────────────────────────────
    public class RegisterDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        public string FirstName { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string LastName { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.EmailAddress]
        public string Email { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.MinLength(6)]
        public string Password { get; set; } = "";
        public string? Currency { get; set; }
    }

    public class LoginDto
    {
        [System.ComponentModel.DataAnnotations.Required]
        [System.ComponentModel.DataAnnotations.EmailAddress]
        public string Email { get; set; } = "";
        [System.ComponentModel.DataAnnotations.Required]
        public string Password { get; set; } = "";
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = "";
        public string Email { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Currency { get; set; } = "";
        public string Theme { get; set; } = "";
        public DateTime ExpiresAt { get; set; }
    }
}