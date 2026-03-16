using FinTrack.Data;
using FinTrack.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FinTrack
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var db = services.GetRequiredService<AppDbContext>();

            // ── Run pending migrations first ─────────────────────────
            await db.Database.MigrateAsync();

            // ── Demo accounts ────────────────────────────────────────
            var accounts = new[]
            {
                new { FirstName="Syed Hamza",    LastName="Imran",   Email="hamza@fintrack.demo",   Password="Demo@123!", Currency="USD" },
                new { FirstName="Fareeha Fatima",LastName="Khokhar", Email="fareeha@fintrack.demo", Password="Demo@456!", Currency="USD" },
                new { FirstName="Anamta",        LastName="Sajid",   Email="anamta@fintrack.demo",  Password="Demo@789!", Currency="USD" },
                new { FirstName="Test",          LastName="User",    Email="test@fintrack.demo",    Password="Test@000!", Currency="USD" },
            };

            foreach (var a in accounts)
            {
                // Skip if already exists
                if (await userManager.FindByEmailAsync(a.Email) != null)
                    continue;

                var user = new ApplicationUser
                {
                    UserName = a.Email,
                    Email = a.Email,
                    FirstName = a.FirstName,
                    LastName = a.LastName,
                    Currency = a.Currency,
                    Theme = "dark",
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(user, a.Password);
                if (!result.Succeeded)
                {
                    Console.WriteLine($"[Seeder] Failed to create {a.Email}: " +
                        string.Join(", ", result.Errors.Select(e => e.Description)));
                    continue;
                }

                Console.WriteLine($"[Seeder] Created user: {a.Email}");

                // Seed categories for this user
                await SeedCategoriesAsync(db, user.Id);

                // Seed data only for non-test accounts
                if (a.Email != "test@fintrack.demo")
                {
                    await SeedFinanceDataAsync(db, user.Id, a.Email);
                }
            }

            Console.WriteLine("[Seeder] Done.");
        }

        // ════════════════════════════════════════════════════════
        // DEFAULT CATEGORIES
        // ════════════════════════════════════════════════════════
        private static async Task SeedCategoriesAsync(AppDbContext db, string userId)
        {
            var categories = new[]
            {
                new Category { UserId=userId, Name="Salary",        Type="Income",  Icon="briefcase",      Color="#3ecf8e", isDefault=true },
                new Category { UserId=userId, Name="Freelance",     Type="Income",  Icon="laptop",         Color="#5b9cf6", isDefault=true },
                new Category { UserId=userId, Name="Food & Dining", Type="Expense", Icon="utensils",       Color="#f5a623", isDefault=true },
                new Category { UserId=userId, Name="Transport",     Type="Expense", Icon="car",            Color="#5b9cf6", isDefault=true },
                new Category { UserId=userId, Name="Housing",       Type="Expense", Icon="home",           Color="#a78bfa", isDefault=true },
                new Category { UserId=userId, Name="Healthcare",    Type="Expense", Icon="heart-pulse",    Color="#f25c6e", isDefault=true },
                new Category { UserId=userId, Name="Entertainment", Type="Expense", Icon="clapperboard",   Color="#f5a623", isDefault=true },
                new Category { UserId=userId, Name="Shopping",      Type="Expense", Icon="shopping-bag",   Color="#a78bfa", isDefault=true },
                new Category { UserId=userId, Name="Education",     Type="Expense", Icon="graduation-cap", Color="#5b9cf6", isDefault=true },
                new Category { UserId=userId, Name="Savings",       Type="Expense", Icon="wallet",         Color="#3ecf8e", isDefault=true },
            };

            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();
        }

        // ════════════════════════════════════════════════════════
        // FINANCE DATA — different dataset per user
        // ════════════════════════════════════════════════════════
        private static async Task SeedFinanceDataAsync(AppDbContext db, string userId, string email)
        {
            // Helper: get category ID by name for this user
            var cats = await db.Categories
                .Where(c => c.UserId == userId)
                .ToDictionaryAsync(c => c.Name, c => c.Id);

            if (email == "hamza@fintrack.demo")
                await SeedHamzaData(db, userId, cats);
            else if (email == "fareeha@fintrack.demo")
                await SeedFareehaData(db, userId, cats);
            else if (email == "anamta@fintrack.demo")
                await SeedAnamtaData(db, userId, cats);
        }

        // ════════════════════════════════════════════════════════
        // USER 1 — HAMZA — Full dataset
        // ════════════════════════════════════════════════════════
        private static async Task SeedHamzaData(AppDbContext db, string userId, Dictionary<string, int> cats)
        {
            // Transactions — Jan to Mar 2026
            var transactions = new List<Transaction>
            {
                // January
                new() { UserId=userId, CategoryId=cats["Salary"],        Description="Monthly Salary",       Amount=5000, Type="Income",  Date=new DateTime(2026,1,1),  Notes="January salary" },
                new() { UserId=userId, CategoryId=cats["Freelance"],     Description="Freelance Web Project", Amount=800,  Type="Income",  Date=new DateTime(2026,1,10), Notes="Logo design project" },
                new() { UserId=userId, CategoryId=cats["Food & Dining"], Description="Grocery Shopping",      Amount=220,  Type="Expense", Date=new DateTime(2026,1,3),  Notes="Monthly groceries" },
                new() { UserId=userId, CategoryId=cats["Transport"],     Description="Uber Rides",            Amount=85,   Type="Expense", Date=new DateTime(2026,1,7) },
                new() { UserId=userId, CategoryId=cats["Housing"],       Description="Rent Payment",          Amount=1500, Type="Expense", Date=new DateTime(2026,1,1),  Notes="January rent" },
                new() { UserId=userId, CategoryId=cats["Entertainment"], Description="Netflix & Spotify",     Amount=25,   Type="Expense", Date=new DateTime(2026,1,15), Notes="Streaming subscriptions" },
                new() { UserId=userId, CategoryId=cats["Shopping"],      Description="Clothing Purchase",     Amount=150,  Type="Expense", Date=new DateTime(2026,1,20), Notes="Winter clothes" },
                // February
                new() { UserId=userId, CategoryId=cats["Salary"],        Description="Monthly Salary",        Amount=5000, Type="Income",  Date=new DateTime(2026,2,1),  Notes="February salary" },
                new() { UserId=userId, CategoryId=cats["Freelance"],     Description="Freelance App Project", Amount=1200, Type="Income",  Date=new DateTime(2026,2,14), Notes="Mobile app UI" },
                new() { UserId=userId, CategoryId=cats["Food & Dining"], Description="Restaurant Dinner",     Amount=95,   Type="Expense", Date=new DateTime(2026,2,5),  Notes="Team dinner" },
                new() { UserId=userId, CategoryId=cats["Transport"],     Description="Fuel",                  Amount=60,   Type="Expense", Date=new DateTime(2026,2,10) },
                new() { UserId=userId, CategoryId=cats["Housing"],       Description="Rent Payment",          Amount=1500, Type="Expense", Date=new DateTime(2026,2,1),  Notes="February rent" },
                new() { UserId=userId, CategoryId=cats["Healthcare"],    Description="Doctor Visit",          Amount=80,   Type="Expense", Date=new DateTime(2026,2,18), Notes="Check-up" },
                new() { UserId=userId, CategoryId=cats["Education"],     Description="Online Course",         Amount=199,  Type="Expense", Date=new DateTime(2026,2,22), Notes="Angular advanced course" },
                // March
                new() { UserId=userId, CategoryId=cats["Salary"],        Description="Monthly Salary",        Amount=5000, Type="Income",  Date=new DateTime(2026,3,1),  Notes="March salary" },
                new() { UserId=userId, CategoryId=cats["Freelance"],     Description="Freelance Dashboard",   Amount=950,  Type="Income",  Date=new DateTime(2026,3,8),  Notes="FinTrack related work" },
                new() { UserId=userId, CategoryId=cats["Food & Dining"], Description="Grocery Shopping",      Amount=245,  Type="Expense", Date=new DateTime(2026,3,2) },
                new() { UserId=userId, CategoryId=cats["Transport"],     Description="Car Service",           Amount=180,  Type="Expense", Date=new DateTime(2026,3,6),  Notes="Oil change" },
                new() { UserId=userId, CategoryId=cats["Housing"],       Description="Rent Payment",          Amount=1500, Type="Expense", Date=new DateTime(2026,3,1),  Notes="March rent" },
                new() { UserId=userId, CategoryId=cats["Entertainment"], Description="Movie & Dining Out",    Amount=120,  Type="Expense", Date=new DateTime(2026,3,12), Notes="Weekend outing" },
                new() { UserId=userId, CategoryId=cats["Shopping"],      Description="Electronics",           Amount=350,  Type="Expense", Date=new DateTime(2026,3,14), Notes="Keyboard and mouse" },
            };
            db.Transactions.AddRange(transactions);

            // Budgets — March 2026
            db.Budgets.AddRange(
                new Budget { UserId = userId, CategoryId = cats["Food & Dining"], Amount = 300, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Transport"], Amount = 200, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Housing"], Amount = 1500, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Entertainment"], Amount = 150, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Shopping"], Amount = 400, Month = 3, Year = 2026, Period = "Monthly" }
            );

            // Savings Goals
            db.SavingsGoals.AddRange(
                new SavingsGoal { UserId = userId, Name = "Emergency Fund", TargetAmount = 10000, SavedAmount = 4200, TargetDate = new DateTime(2026, 12, 31), Status = "Active" },
                new SavingsGoal { UserId = userId, Name = "New Laptop", TargetAmount = 2000, SavedAmount = 1350, TargetDate = new DateTime(2026, 6, 30), Status = "Active" },
                new SavingsGoal { UserId = userId, Name = "Vacation Fund", TargetAmount = 5000, SavedAmount = 5000, TargetDate = new DateTime(2026, 8, 1), Status = "Completed" }
            );

            // Investments
            db.Investments.AddRange(
                new Investment { UserId = userId, Name = "Apple Inc", AssetType = "Stocks", Quantity = 10, BuyPrice = 150, CurrentPrice = 182, PurchaseDate = new DateTime(2025, 6, 15), Ticker = "AAPL" },
                new Investment { UserId = userId, Name = "Bitcoin", AssetType = "Crypto", Quantity = 0.05m, BuyPrice = 42000, CurrentPrice = 67000, PurchaseDate = new DateTime(2025, 1, 10), Ticker = "BTC" },
                new Investment { UserId = userId, Name = "US Bond ETF", AssetType = "Bonds", Quantity = 50, BuyPrice = 100, CurrentPrice = 98.50m, PurchaseDate = new DateTime(2025, 3, 1), Ticker = "BND" }
            );

            // Debts
            db.Debts.AddRange(
                new Debt { UserId = userId, Name = "Student Loan", DebtType = "Student Loan", OriginalAmount = 15000, RemainingBalance = 9800, InterestRate = 5.5m, ExpectedPayoffDate = new DateTime(2031, 6, 1), Priority = "Medium" },
                new Debt { UserId = userId, Name = "Credit Card", DebtType = "Credit Card", OriginalAmount = 2500, RemainingBalance = 1200, InterestRate = 18.99m, ExpectedPayoffDate = new DateTime(2026, 4, 15), Priority = "High" }
            );

            // Notifications
            db.Notifications.AddRange(
                new Notification { UserId = userId, Title = "Welcome to FinTrack!", Message = "Your account is set up. Start by adding your first transaction.", Type = "Info", IsRead = true },
                new Notification { UserId = userId, Title = "Shopping Budget Warning", Message = "You have used 87% of your Shopping budget. Consider slowing down spending.", Type = "Alert", IsRead = false },
                new Notification { UserId = userId, Title = "Vacation Fund Completed!", Message = "Congratulations! You have reached your Vacation Fund goal of $5,000.", Type = "Success", IsRead = false }
            );

            await db.SaveChangesAsync();
            Console.WriteLine("[Seeder] Hamza data seeded.");
        }

        // ════════════════════════════════════════════════════════
        // USER 2 — FAREEHA — Budget-focused
        // ════════════════════════════════════════════════════════
        private static async Task SeedFareehaData(AppDbContext db, string userId, Dictionary<string, int> cats)
        {
            db.Transactions.AddRange(
                new Transaction { UserId = userId, CategoryId = cats["Salary"], Description = "Monthly Salary", Amount = 4200, Type = "Income", Date = new DateTime(2026, 3, 1) },
                new Transaction { UserId = userId, CategoryId = cats["Food & Dining"], Description = "Grocery & Food", Amount = 380, Type = "Expense", Date = new DateTime(2026, 3, 2) },
                new Transaction { UserId = userId, CategoryId = cats["Food & Dining"], Description = "Restaurant Meals", Amount = 210, Type = "Expense", Date = new DateTime(2026, 3, 8), Notes = "Multiple dining outs" },
                new Transaction { UserId = userId, CategoryId = cats["Transport"], Description = "Bus & Metro", Amount = 95, Type = "Expense", Date = new DateTime(2026, 3, 5) },
                new Transaction { UserId = userId, CategoryId = cats["Housing"], Description = "Rent", Amount = 1800, Type = "Expense", Date = new DateTime(2026, 3, 1) },
                new Transaction { UserId = userId, CategoryId = cats["Entertainment"], Description = "Shopping Spree", Amount = 420, Type = "Expense", Date = new DateTime(2026, 3, 10), Notes = "Weekend shopping" },
                new Transaction { UserId = userId, CategoryId = cats["Entertainment"], Description = "Online Shopping", Amount = 185, Type = "Expense", Date = new DateTime(2026, 3, 13), Notes = "Amazon orders" },
                new Transaction { UserId = userId, CategoryId = cats["Shopping"], Description = "Clothes", Amount = 290, Type = "Expense", Date = new DateTime(2026, 3, 9), Notes = "New season wardrobe" }
            );

            db.Budgets.AddRange(
                new Budget { UserId = userId, CategoryId = cats["Food & Dining"], Amount = 500, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Transport"], Amount = 120, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Housing"], Amount = 1800, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Entertainment"], Amount = 500, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Shopping"], Amount = 300, Month = 3, Year = 2026, Period = "Monthly" }
            );

            db.SavingsGoals.AddRange(
                new SavingsGoal { UserId = userId, Name = "Wedding Fund", TargetAmount = 20000, SavedAmount = 3500, TargetDate = new DateTime(2027, 6, 1), Status = "Active" },
                new SavingsGoal { UserId = userId, Name = "Car Down Payment", TargetAmount = 8000, SavedAmount = 2100, TargetDate = new DateTime(2026, 12, 1), Status = "Active" }
            );

            db.Investments.AddRange(
                new Investment { UserId = userId, Name = "S&P 500 ETF", AssetType = "Stocks", Quantity = 20, BuyPrice = 450, CurrentPrice = 512, PurchaseDate = new DateTime(2025, 9, 1), Ticker = "SPY" },
                new Investment { UserId = userId, Name = "Gold ETF", AssetType = "Bonds", Quantity = 15, BuyPrice = 180, CurrentPrice = 195, PurchaseDate = new DateTime(2025, 11, 1), Ticker = "GLD" }
            );

            db.Debts.AddRange(
                new Debt { UserId = userId, Name = "Car Loan", DebtType = "Car Loan", OriginalAmount = 18000, RemainingBalance = 13500, InterestRate = 7.2m, ExpectedPayoffDate = new DateTime(2028, 8, 1), Priority = "Medium" },
                new Debt { UserId = userId, Name = "Personal Loan", DebtType = "Personal Loan", OriginalAmount = 5000, RemainingBalance = 3200, InterestRate = 12, ExpectedPayoffDate = new DateTime(2027, 1, 1), Priority = "Medium" }
            );

            db.Notifications.AddRange(
                new Notification { UserId = userId, Title = "Food & Dining Budget Exceeded", Message = "You have exceeded your Food & Dining budget of $500. Total spent: $590.", Type = "Alert", IsRead = false },
                new Notification { UserId = userId, Title = "Entertainment Budget Exceeded", Message = "Your Entertainment budget of $500 has been exceeded. Spent: $605.", Type = "Alert", IsRead = false },
                new Notification { UserId = userId, Title = "Transport Budget Warning", Message = "You are at 79% of your Transport budget. Only $25 remaining.", Type = "Alert", IsRead = true }
            );

            await db.SaveChangesAsync();
            Console.WriteLine("[Seeder] Fareeha data seeded.");
        }

        // ════════════════════════════════════════════════════════
        // USER 3 — ANAMTA — Savings & investments focused
        // ════════════════════════════════════════════════════════
        private static async Task SeedAnamtaData(AppDbContext db, string userId, Dictionary<string, int> cats)
        {
            db.Transactions.AddRange(
                new Transaction { UserId = userId, CategoryId = cats["Salary"], Description = "Monthly Salary", Amount = 3800, Type = "Income", Date = new DateTime(2026, 3, 1) },
                new Transaction { UserId = userId, CategoryId = cats["Freelance"], Description = "Tutoring Income", Amount = 600, Type = "Income", Date = new DateTime(2026, 3, 10), Notes = "Private tutoring" },
                new Transaction { UserId = userId, CategoryId = cats["Food & Dining"], Description = "Groceries", Amount = 180, Type = "Expense", Date = new DateTime(2026, 3, 3) },
                new Transaction { UserId = userId, CategoryId = cats["Transport"], Description = "Transport", Amount = 55, Type = "Expense", Date = new DateTime(2026, 3, 4) },
                new Transaction { UserId = userId, CategoryId = cats["Housing"], Description = "Rent", Amount = 1200, Type = "Expense", Date = new DateTime(2026, 3, 1) },
                new Transaction { UserId = userId, CategoryId = cats["Savings"], Description = "Transfer to Savings", Amount = 500, Type = "Expense", Date = new DateTime(2026, 3, 5), Notes = "Emergency fund contribution" }
            );

            db.Budgets.AddRange(
                new Budget { UserId = userId, CategoryId = cats["Food & Dining"], Amount = 250, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Transport"], Amount = 100, Month = 3, Year = 2026, Period = "Monthly" },
                new Budget { UserId = userId, CategoryId = cats["Housing"], Amount = 1200, Month = 3, Year = 2026, Period = "Monthly" }
            );

            db.SavingsGoals.AddRange(
                new SavingsGoal { UserId = userId, Name = "House Down Payment", TargetAmount = 50000, SavedAmount = 12000, TargetDate = new DateTime(2028, 1, 1), Status = "Active" },
                new SavingsGoal { UserId = userId, Name = "Masters Degree", TargetAmount = 15000, SavedAmount = 8500, TargetDate = new DateTime(2027, 9, 1), Status = "Active" },
                new SavingsGoal { UserId = userId, Name = "Investment Seed", TargetAmount = 5000, SavedAmount = 5000, TargetDate = null, Status = "Completed" }
            );

            db.Investments.AddRange(
                new Investment { UserId = userId, Name = "Microsoft", AssetType = "Stocks", Quantity = 8, BuyPrice = 310, CurrentPrice = 415, PurchaseDate = new DateTime(2024, 12, 1), Ticker = "MSFT" },
                new Investment { UserId = userId, Name = "Fixed Deposit", AssetType = "Fixed Deposit", Quantity = 1, BuyPrice = 5000, CurrentPrice = 5350, PurchaseDate = new DateTime(2025, 3, 15), Ticker = "N/A" },
                new Investment { UserId = userId, Name = "Ethereum", AssetType = "Crypto", Quantity = 0.5m, BuyPrice = 2800, CurrentPrice = 3600, PurchaseDate = new DateTime(2025, 6, 1), Ticker="ETH" }
            );

            db.Debts.Add(
                new Debt { UserId = userId, Name = "Education Loan", DebtType = "Student Loan", OriginalAmount = 20000, RemainingBalance = 14000, InterestRate = 4.5m, ExpectedPayoffDate = new DateTime(2030, 9, 1), Priority = "Low" }
            );

            db.Notifications.AddRange(
                new Notification { UserId = userId, Title = "Investment Seed Complete!", Message = "Your Investment Seed goal of $5,000 has been reached. Time to invest!", Type = "Success", IsRead = false },
                new Notification { UserId = userId, Title = "Monthly Summary Ready", Message = "Your March 2026 financial summary is ready. Check the Reports page.", Type = "Info", IsRead = true }
            );

            await db.SaveChangesAsync();
            Console.WriteLine("[Seeder] Anamta data seeded.");
        }
    }
}