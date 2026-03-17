# FinTrack — Online Personal Finance Dashboard

> A full-stack personal finance web application built with **Angular 17** and **ASP.NET Core 8 Web API** — featuring JWT authentication via ASP.NET Identity, expense tracking, budget management, investment monitoring, debt tracking, savings goals, financial reporting, and an integrated AI assistant powered by OpenRouter.

![Status](https://img.shields.io/badge/status-complete-B6FF3B?style=flat-square&labelColor=0C1A2B)
![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=flat-square&logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core_8-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=flat-square&logo=csharp&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=flat-square&logo=microsoftsqlserver&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Visual Studio](https://img.shields.io/badge/Visual_Studio_2022-5C2D91?style=flat-square&logo=visual-studio&logoColor=white)
![OpenRouter](https://img.shields.io/badge/OpenRouter_AI-000000?style=flat-square&logoColor=white)

---

## Project Info

| Field | Detail |
|---|---|
| **Project Name** | Online Personal Finance Dashboard (FinTrack) |
| **Team** | Syed Hamza Imran · Fareeha Fatima Khokhar · Anamta Sajid · Safa Noor Fatima |
| **Enrollment Nos.** | Student1595738 · Student1595710 · Student1589118 · Student1610740 |
| **Curriculum** | ACCP Prime 2 — 3rd Semester |
| **Centre** | Aptech Computer Education, Malir Centre |
| **Duration** | 21 Feb 2026 — 24 Mar 2026 |

---

## Overview

FinTrack is a full-stack personal finance dashboard built as an **Aptech eProject** submission. It solves the problem of scattered financial data — most people manage money across multiple apps, spreadsheets, and bank portals with no single overview. FinTrack brings everything together: every transaction you log feeds your budget progress, category breakdowns, and monthly reports automatically. Every deposit updates your savings goal in real time. Every payment reduces your debt balance on screen.

On top of the core finance management, FinTrack includes an **AI layer** powered by OpenRouter — a floating AI chat assistant, natural language transaction entry, smart budget notifications, and monthly AI-written financial analysis reports.

The project was built across multiple phases:

| Phase | What was built |
|---|---|
| **Phase 0** | Pure HTML / CSS / JavaScript prototype — all 14 pages, no backend |
| **Phase 1** | ASP.NET Core MVC with Razor Views, EF Core, SQL Server, ASP.NET Core Identity |
| **Phase 2** | Angular 17 SPA frontend consuming a dedicated ASP.NET Core 8 REST API over JWT |
| **Phase 3 (current)** | AI integration — OpenRouter-powered chat, NLP transaction entry, smart notifications, monthly report |

---

## Features

### Core Modules

| Module | Route | Description |
|---|---|---|
| **Landing Page** | `/` | Marketing page — dual navbar state: guests see Login/Register; authenticated users see Go to Dashboard |
| **Register** | `/auth/register` | Creates account, hashes password via Identity, seeds 10 default categories, issues JWT |
| **Login** | `/auth/login` | Validates credentials, issues JWT stored in localStorage |
| **Dashboard** | `/dashboard` | 4 KPI cards (net worth, income, expenses, savings rate), recent transactions, budget progress, savings goal cards, 6-month line chart |
| **Transactions** | `/transactions` | Full income and expense ledger with type/category/date filters, search, pagination, and full CRUD via modal. Includes AI natural language entry bar |
| **Expenses** | `/expenses` | Filtered Expense-type transactions with category breakdown doughnut chart |
| **Budget** | `/budget` | Monthly budget per category with colour-coded progress bars (green → amber → red) and overspend alerts |
| **Savings Goals** | `/savings` | Goal cards with progress ring, add-funds modal, auto-complete on target reached |
| **Investments** | `/investments` | Portfolio table with asset type, buy/current price, gain/loss computed client-side, full CRUD |
| **Debt Management** | `/debt` | Debt cards with payoff progress bar, priority chips (High/Medium/Low), record-payment modal |
| **Reports** | `/reports` | Monthly income vs expense bar chart, expense category doughnut, net worth breakdown, and AI financial analysis tab |
| **Notifications** | `/notifications` | Auto-generated alerts for budget exceeded and goal completed; mark individual or all as read; delete |
| **Categories** | `/categories` | Create and manage income/expense categories with Lucide icon picker and colour swatch picker |
| **Education** | `/education` | API-driven articles, learning modules, guides, and four client-side calculators |
| **Settings** | `/settings` | Three tabs — Profile (name, occupation, DOB), Preferences (currency, dark/light theme), Security (change password) |

### AI Features

| Feature | How to access | Description |
|---|---|---|
| **AI Chat Assistant** | Floating sparkle button (bottom-right, every page) | Ask anything about your finances. Context-aware — knows your recent transactions, budgets, and goals |
| **Natural Language Entry** | Add Transaction modal → AI bar at top | Type in plain English e.g. *"Spent 5000 on groceries today"* — form fields auto-fill instantly |
| **Smart Notifications** | Automatic — no action needed | Backend generates AI-written notifications when budget hits 80% (WARNING) or 100%+ (EXCEEDED) |
| **Monthly AI Report** | Reports page → AI Analysis tab | Click Generate Report for a 4-paragraph AI analysis: overview, what went well, needs attention, tip for next month |

---

## Tech Stack

### Backend — ASP.NET Core 8 Web API

| Layer | Technology | Notes |
|---|---|---|
| Framework | ASP.NET Core 8 | Pure JSON REST API — no Razor Views |
| Language | C# | |
| ORM | Entity Framework Core 8 | Code-First migrations |
| Authentication | ASP.NET Core Identity + JWT Bearer | Token stored client-side, validated on every request |
| Password Hashing | ASP.NET Core Identity (PBKDF2) | Passwords never stored as plain text |
| Database | Microsoft SQL Server Express | Free edition — Trusted Connection (Windows Auth) |
| AI | OpenRouter API | HTTP calls via `GeminiService` — no NuGet package needed |
| API Docs | Swashbuckle (Swagger) | Auto-generated at `/swagger` |
| IDE | Visual Studio 2022 | |

### Frontend — Angular 17

| Layer | Technology | Notes |
|---|---|---|
| Framework | Angular 17+ | NgModule architecture — **no standalone components** |
| Language | TypeScript | |
| HTTP | `HttpClientModule` + `AuthInterceptor` | JWT auto-attached to every outgoing request |
| Forms | Angular Reactive Forms | `FormBuilder`, `FormGroup`, `Validators` throughout |
| Icons | `lucide-angular` | Zero emojis anywhere in the UI |
| Charts | Chart.js | Dashboard and Reports pages |
| Styles | SCSS + CSS Custom Properties | Full design token system |
| Fonts | Outfit — Google Fonts | Weights 300–900 |

---

## Design System — v3 Navy + Electric Lime

All visual tokens are defined as CSS custom properties in `styles.scss` and referenced throughout — never hardcoded hex values in component styles.

### Brand Colours

| Role | Token | Hex | Usage |
|---|---|---|---|
| Background | `--bg-base` | `#0C1A2B` | Deep navy — main page background |
| Card surface | `--bg-raised` | `#112236` | Cards, modals, sidebar |
| Float | `--bg-float` | `#162B43` | Dropdowns, tooltips |
| Accent | `--accent` | `#B6FF3B` | Electric Lime — buttons, active nav, focus rings |
| Accent text | `--text-inverse` | `#0C1A2B` | Text placed ON top of lime buttons |
| Positive | `--positive` | `#3ECF8E` | Income, success, goal completion |
| Negative | `--negative` | `#F25C6E` | Expense, error, budget exceeded |
| Warning | `--warning` | `#FFB547` | Caution, 80% budget threshold |
| Info | `--info` | `#5B9CF6` | Savings bars, informational elements |
| Purple | `--purple` | `#A78BFA` | Investment accent |

### Typography

Typeface throughout: **Syne(Headings)** & **DM Sans(Body)** (Google Fonts), weights 300–900.

### Icons

All icons use `lucide-angular`. Icon names are stored as kebab-case strings in the database (e.g. `"utensils"`, `"heart-pulse"`) and rendered in Angular templates:

```html
<lucide-angular [name]="category.icon" [size]="18"></lucide-angular>
```

---

## Project Structure

### Backend (ASP.NET Core)

```
FinTrack/
├── FinTrack.sln
└── FinTrack/
    ├── Program.cs                        # Entry point — CORS, Identity, JWT, EF Core, AI registered here
    ├── DataSeeder.cs                     # Auto-seeds 4 demo accounts + full data on first run
    ├── appsettings.json                  # Connection string + JWT + OpenRouter config (not committed)
    │
    ├── Controllers/
    │   └── Api/
    │       ├── AuthController.cs         # POST /api/auth/register  POST /api/auth/login  GET /api/auth/me
    │       ├── TransactionsController.cs # GET POST PUT DELETE /api/transactions  GET /api/transactions/summary
    │       ├── BudgetController.cs       # GET POST PUT DELETE /api/budget
    │       ├── SavingsController.cs      # CRUD + PATCH /api/savings/:id/deposit
    │       ├── InvestmentsController.cs  # GET POST PUT DELETE /api/investments
    │       ├── DebtController.cs         # CRUD + PATCH /api/debt/:id/payment
    │       ├── CategoriesController.cs   # GET POST PUT DELETE /api/categories
    │       ├── NotificationsController.cs# GET PATCH DELETE + unread-count
    │       ├── ReportsController.cs      # monthly / by-category / daily / net-worth
    │       ├── SettingsController.cs     # GET + PUT profile / preferences / password / account
    │       ├── ExpensesController.cs     # GET /api/expenses  GET /api/expenses/top-categories
    │       ├── DashboardController.cs    # GET /api/dashboard
    │       └── AiController.cs           # chat / parse-transaction / smart-notification / monthly-report / scan-receipt / parse-statement
    │
    ├── Models/
    │   ├── ApplicationUser.cs            # Extends IdentityUser — adds FirstName, LastName, Currency, Theme
    │   ├── Category.cs
    │   ├── Transaction.cs
    │   ├── Budget.cs
    │   ├── Investment.cs
    │   ├── Debt.cs
    │   ├── SavingsGoal.cs
    │   └── Notification.cs
    │
    ├── Services/
    │   └── GeminiService.cs              # OpenRouter HTTP client — AskAsync() and AskWithImageAsync()
    │
    ├── Data/
    │   └── AppDbContext.cs               # IdentityDbContext<ApplicationUser> with all DbSets
    │
    └── Migrations/                       # EF Core auto-generated migration files
```

### Frontend (Angular)

```
fintrack-angular/
└── src/
    ├── app/
    │   ├── core/
    │   │   ├── guards/
    │   │   │   └── auth.guard.ts         # Blocks unauthenticated access, redirects to /auth/login
    │   │   ├── interceptors/
    │   │   │   └── auth.interceptor.ts   # Reads token from localStorage, adds Authorization header
    │   │   ├── models/                   # TypeScript interfaces matching API JSON shapes
    │   │   └── services/
    │   │       ├── auth.service.ts
    │   │       ├── api.services.ts       # All feature HTTP services in one file
    │   │       └── ai.service.ts         # AI endpoints — chat, parseTransaction, getMonthlyReport
    │   │
    │   ├── shared/
    │   │   ├── components/               # Reusable UI components (dropdown, app-icon, etc.)
    │   │   ├── utils/
    │   │   │   ├── date.util.ts          # today() · toISO() · fromISO()
    │   │   │   └── error.util.ts         # extractError(err) — normalises API errors to a string
    │   │   └── shared.module.ts          # Exports CommonModule, ReactiveFormsModule, LucideAngularModule
    │   │
    │   └── features/                     # One folder per page — lazy loaded
    │       ├── auth/                     # login + register
    │       ├── landing/
    │       ├── shell/                    # Sidebar + topbar + bottom-nav + AI chat panel
    │       ├── dashboard/
    │       ├── transactions/             # + AI natural language bar
    │       ├── expenses/
    │       ├── budget/
    │       ├── savings/
    │       ├── investments/
    │       ├── debt/
    │       ├── reports/                  # + AI Analysis tab
    │       ├── notifications/
    │       ├── categories/
    │       ├── settings/
    │       └── education/
    │
    ├── styles.scss                       # Global design tokens, shared component classes, animations
    └── index.html
```

---

## Database Schema

Eight tables total (plus ASP.NET Identity tables). Every table carries a `UserId` foreign key so all queries are scoped to the authenticated user — no user can ever access another user's data.

```
ApplicationUser  (extends ASP.NET Identity IdentityUser)
    ├── has many ──▶  Categories
    │       └── has many ──▶  Transactions
    │       └── has many ──▶  Budgets
    ├── has many ──▶  Transactions
    ├── has many ──▶  Budgets
    ├── has many ──▶  Investments
    ├── has many ──▶  Debts
    ├── has many ──▶  SavingsGoals
    └── has many ──▶  Notifications
```

### Important Design Rules

- `Budget.SpentAmount` is **never stored** — calculated at query time by summing matching Transactions
- `SavingsGoal.ProgressPercent` is **never stored** — derived from `savedAmount / targetAmount`
- `Debt.PaidOffPercent` is **never stored** — derived from original vs remaining balance
- `Investment.TotalValue`, `GainLoss`, `GainLossPct` — **computed in Angular**, never sent to the API
- `Category.Icon` stores a Lucide icon name as a plain string (e.g. `"utensils"`) — rendered with `<lucide-angular [name]="category.icon">`
- All date range filters use `>= startDate && < endDate` — never `.Month`/`.Year` property access (EF Core SQL translation compatibility)

### Default Categories Seeded on Registration

| Name | Type | Icon |
|---|---|---|
| Salary | Income | `briefcase` |
| Freelance | Income | `laptop` |
| Food & Dining | Expense | `utensils` |
| Transport | Expense | `car` |
| Housing | Expense | `home` |
| Healthcare | Expense | `heart-pulse` |
| Entertainment | Expense | `clapperboard` |
| Shopping | Expense | `shopping-bag` |
| Education | Expense | `graduation-cap` |
| Savings | Expense | `wallet` |

---

## API Reference

**Base URL:** `https://localhost:7030/api`

Every endpoint except `/api/auth/register` and `/api/auth/login` requires:
```
Authorization: Bearer <JWT token>
```

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` |
| **Transactions** | `GET POST /api/transactions` · `GET PUT DELETE /api/transactions/:id` · `GET /api/transactions/summary` |
| **Budget** | `GET POST /api/budget` · `GET PUT DELETE /api/budget/:id` · `GET /api/budget/overview` |
| **Savings** | `GET POST /api/savings` · `GET PUT DELETE /api/savings/:id` · `PATCH /api/savings/:id/deposit` |
| **Investments** | `GET POST /api/investments` · `GET PUT DELETE /api/investments/:id` |
| **Debt** | `GET POST /api/debt` · `GET PUT DELETE /api/debt/:id` · `PATCH /api/debt/:id/payment` |
| **Categories** | `GET POST /api/categories` · `GET PUT DELETE /api/categories/:id` |
| **Notifications** | `GET /api/notifications` · `GET /api/notifications/unread-count` · `PATCH /api/notifications/:id/read` · `PATCH /api/notifications/read-all` · `DELETE /api/notifications/:id` |
| **Reports** | `GET /api/reports/monthly` · `GET /api/reports/by-category` · `GET /api/reports/daily` · `GET /api/reports/net-worth` |
| **Expenses** | `GET /api/expenses` · `GET /api/expenses/top-categories` |
| **Dashboard** | `GET /api/dashboard` |
| **Settings** | `GET /api/settings` · `PUT /api/settings/profile` · `PUT /api/settings/preferences` · `PUT /api/settings/password` · `DELETE /api/settings/account` |
| **AI** | `POST /api/ai/chat` · `POST /api/ai/parse-transaction` · `POST /api/ai/smart-notification` · `GET /api/ai/monthly-report` · `POST /api/ai/scan-receipt` · `POST /api/ai/parse-statement` |

Full interactive API documentation is available at `https://localhost:7030/swagger` when the backend is running.

---

## Getting Started

You need to run **two separate applications** simultaneously — the ASP.NET Core API and the Angular dev server. They run on different ports and communicate over HTTP.

---

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| [Visual Studio 2022](https://visualstudio.microsoft.com/) | Latest | Free Community edition works. Select **ASP.NET and web development** workload |
| .NET 8 SDK | 8.0+ | Bundled with Visual Studio 2022. Verify: `dotnet --version` |
| SQL Server Express | Any | Free edition — [download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| [Node.js](https://nodejs.org/) | 18+ | Verify: `node --version` |
| Angular CLI | 17+ | `npm install -g @angular/cli` — verify: `ng version` |
| [Git](https://git-scm.com/) | Any | |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/fintrack.git
cd fintrack
```

Or in Visual Studio: **File → Clone Repository** → paste the URL → Clone.

---

### Step 2 — Backend Setup (ASP.NET Core API)

#### 2a. Open the solution

Double-click `FinTrack.sln`, or go to **File → Open → Project/Solution** in Visual Studio.

#### 2b. Configure `appsettings.json`

Open `FinTrack/appsettings.json` and fill in all three sections:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=FinTrackDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "your-super-secret-key-must-be-at-least-32-characters-long",
    "Issuer": "FinTrackAPI",
    "Audience": "FinTrackAngularClient",
    "ExpiresInHours": 24
  },
  "Gemini": {
    "ApiKey": "your-openrouter-api-key-here",
    "Model": "mistralai/mistral-7b-instruct:free"
  }
}
```

> **Connection string:** Replace `localhost\\SQLEXPRESS` with your actual SQL Server instance name. Find it by opening SSMS — the server name is shown in the connection dialog.

> **JWT Key:** Must be at least 32 characters. Use any long random string for local dev. Never commit a real production secret to source control.

> **OpenRouter API key:** Sign up free at [openrouter.ai](https://openrouter.ai) to get a key. AI features will not work without it, but all other features work normally.

#### 2c. Run the API

Press **F5** in Visual Studio. On first run, the app will automatically:

1. Run all pending EF Core migrations — creates `FinTrackDB` and all tables
2. Run `DataSeeder` — creates 4 demo accounts with full finance data

Watch the **Output window** (View → Output → select "FinTrack") for:

```
[Seeder] Created user: hamza@fintrack.demo
[Seeder] Hamza data seeded.
[Seeder] Created user: fareeha@fintrack.demo
...
[Seeder] Done.
```

#### 2d. Verify the API is running

Open `https://localhost:7030/swagger/index.html` in your browser.

> **Certificate warning?** Run `dotnet dev-certs https --trust` in a terminal, then close and reopen all browser windows.

You should see Swagger UI listing all endpoints including the AI ones.

---

### Step 3 — Frontend Setup (Angular)

Open a **new terminal** — keep Visual Studio running in the background.

#### 3a. Navigate to the Angular folder

```bash
cd fintrack-angular
```

#### 3b. Install dependencies

```bash
npm install
```

Takes 1–2 minutes on first run.

#### 3c. Set the API base URL

Open `src/environments/environment.ts` and confirm the URL matches your backend port:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7030/api'
};
```

If you see a certificate error in the browser console, change `https` to `http` and also comment out `app.UseHttpsRedirection()` in `Program.cs`.

#### 3d. Start the dev server

```bash
ng serve
```

Angular compiles and serves at `http://localhost:4200`. Keep this terminal running.

---

### Step 4 — Verify the Setup

With both applications running, go through this checklist:

1. Open `http://localhost:4200` — you should see the FinTrack landing page in navy and electric lime
2. Click **Login** and sign in with a demo account (credentials below)
3. After logging in you are redirected to `/dashboard` — KPI cards and charts should populate
4. Go to **Transactions** — you should see pre-seeded transactions
5. Go to **Budget** — progress bars should reflect existing transactions
6. Try the **AI Chat** — click the sparkle button (bottom-right) and ask "How much did I spend this month?"

If all steps pass, the frontend, backend, and AI are correctly connected.

---

## Demo Credentials

These accounts are created automatically when the backend starts for the first time via `DataSeeder.cs`.

| Account | Email | Password | Pre-loaded Data |
|---|---|---|---|
| Demo User 1 | `hamza@fintrack.demo` | `Demo@123!` | Full dataset — transactions Jan–Mar, 5 budgets, 3 goals, 3 investments, 2 debts |
| Demo User 2 | `fareeha@fintrack.demo` | `Demo@456!` | Budget-focused — Food & Entertainment budgets exceeded, good for notification demo |
| Demo User 3 | `anamta@fintrack.demo` | `Demo@789!` | Savings & investments focused — goals at different completion stages |
| Test User | `test@fintrack.demo` | `Test@000!` | Blank account — for demonstrating onboarding and default category seeding |

> ⚠️ These credentials are for evaluation and testing only. Change all passwords before any public or production deployment.

---

### Resetting the Demo Data

To wipe all demo data and re-seed from scratch:

1. Open SSMS and run:
   ```sql
   USE master;
   DROP DATABASE FinTrackDB;
   ```
2. Restart the backend — migrations and seeding run automatically on startup.

---

## Troubleshooting

**`ERR_CERT_AUTHORITY_INVALID` in browser console**

Your browser does not trust the ASP.NET dev certificate. Run:
```bash
dotnet dev-certs https --trust
```
Confirm the prompt, then close all browser windows completely and reopen.

Alternatively switch to HTTP by changing `apiUrl` to `http://localhost:7030/api` in `environment.ts` and commenting out `app.UseHttpsRedirection()` in `Program.cs`.

---

**`CORS error` in browser console (`Access-Control-Allow-Origin`)**

The Angular dev server origin must exactly match what is in `Program.cs`. Open `Program.cs` and confirm:
```csharp
policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
```
Restart the API after any change.

---

**`401 Unauthorized` on every API call after logging in**

The JWT `Key` is either too short (minimum 32 characters) or was changed after a token was already issued. Open browser DevTools → Application → Local Storage → delete both `fintrack_token` and `fintrack_user` → log in again.

---

**Swagger shows `Failed to load API definition`**

Hard refresh Swagger: press **Ctrl + Shift + R** on the Swagger page. If that does not fix it, open `https://localhost:7030/swagger/v1/swagger.json` directly — if you see JSON, the API is fine and it is a browser cache issue.

---

**Seeder does not run / demo accounts not created**

Confirm these lines exist at the bottom of `Program.cs`, just before `await app.RunAsync()`:

```csharp
using (var scope = app.Services.CreateScope())
{
    await DataSeeder.SeedAsync(scope.ServiceProvider);
}

await app.RunAsync();
```

Note the use of `await app.RunAsync()` — not `app.Run()`. The `await` is required for the seeder's async calls to complete.

---

**AI features return errors**

- Confirm your OpenRouter API key is set correctly in `appsettings.json`
- Check the model name is correct — try `"mistralai/mistral-7b-instruct:free"` or `"google/gemma-3-4b-it:free"`
- Free tier models on OpenRouter can be temporarily unavailable — try a different model from [openrouter.ai/models](https://openrouter.ai/models) filtered by Free
- All non-AI features work normally without a valid API key

---

**`ng: command not found`**

```bash
npm install -g @angular/cli
```

---

## How Frontend and Backend Connect

Angular never touches the database directly. All data flows through the API over HTTP:

```
User clicks Submit in a form
        │
        ▼
Angular Reactive Form validates all fields
        │
        ▼
Component calls a Service method
e.g.  transactionService.create(dto)
        │
        ▼
HttpClient fires the HTTP request
POST https://localhost:7030/api/transactions
{ description, amount, type, categoryId, date }
        │
        ▼
AuthInterceptor automatically adds the header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        │
        ▼
ASP.NET Core API receives the request
[Authorize] validates the JWT and extracts the userId claim
        │
        ▼
Controller inserts the record scoped to that userId
Budget alert check runs — AI notification generated if threshold crossed
returns 201 Created  { "id": 42 }
        │
        ┌─────────────────────────────┐
        │ SUCCESS                     │ FAILURE
        ▼                             ▼
Angular closes modal           Angular keeps modal open
refreshes the list             displays error message inline
```

### What is Stored in localStorage

| Key | Value |
|---|---|
| `fintrack_token` | Raw JWT string — sent as `Bearer` token on every request |
| `fintrack_user` | JSON stringified `{ id, firstName, lastName, email, currency, theme }` |

Both are written after successful login or register. Both are deleted on logout.

---

## Security

- Passwords are hashed using **ASP.NET Core Identity (PBKDF2)** — never stored as plain text
- All API endpoints except `/auth/register` and `/auth/login` require a valid JWT Bearer token
- JWT tokens expire after **24 hours**
- All database queries are filtered by `userId` — users can never access each other's data
- CORS is restricted to the Angular frontend origin only
- SQL injection is prevented via EF Core parameterised queries
- `appsettings.json` is excluded from Git via `.gitignore` — connection string and secrets never committed

---

## Known Limitations

- Receipt scanner (`POST /api/ai/scan-receipt`) and bank statement import (`POST /api/ai/parse-statement`) are currently disabled — free-tier vision models are unreliable. Both endpoints return a `503` with a helpful message
- No direct bank API integration — transactions are entered manually or via natural language input
- AI features require an active OpenRouter API key with available free-tier quota
- Free OpenRouter models can be temporarily offline — try switching to another free model if one is unavailable

---

## Deliverables

| Deliverable | Status |
|---|---|
| Full-stack web application (Angular 17 + ASP.NET Core 8) | ✅ Complete |
| All 14 pages implemented and connected to live API | ✅ Complete |
| Database schema — EF Core migrations, SQL Server | ✅ Complete |
| JWT authentication via ASP.NET Core Identity | ✅ Complete |
| REST API — 13 controllers, 50+ endpoints | ✅ Complete |
| AI integration — 4 working AI features | ✅ Complete |
| Auto-seeder — 4 demo accounts created on first run | ✅ Complete |
| SQL seed script (`fintrack_seed.sql`) | ✅ Complete |
| Project documentation (SRS, ER diagrams, GUI standards, algorithms) | ✅ Complete |
| 1st Status Report | ✅ Complete |
| 2nd Status Report | ✅ Complete |
| `README.md` | ✅ Complete |
| Demo video (MP4) | ⬜ Pending |
| Live hosted URL | ⬜ Pending |

---

## Roadmap

- [x] Phase 0 — HTML/CSS/JS prototype, all 14 pages, Design System v1 → v3
- [x] Phase 1 — ASP.NET Core MVC, Razor Views, EF Core, ASP.NET Identity
- [x] Phase 2 — REST API + Angular 17 SPA with JWT auth
- [x] All 14 feature pages built and connected to live API
- [x] Design System v3 — Navy `#0C1A2B` + Electric Lime `#B6FF3B`
- [x] Full `lucide-angular` integration — zero emojis in the entire codebase
- [x] AI Chat Assistant — floating panel in shell
- [x] Natural Language Transaction Entry
- [x] Smart AI Budget Notifications
- [x] Monthly AI Financial Report
- [x] Auto-seeder — demo data on first run
- [ ] Receipt scanner (blocked by vision model availability on free tier)
- [ ] Bank statement importer (blocked by vision model availability on free tier)
- [ ] Production build and deployment

---

## Screenshots

> Add screenshots of key pages here.

| Dashboard | Reports | AI Chat |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## License

This project was created for educational purposes as part of the Aptech eProject program.

---

## Authors

| Name | Role |
|---|---|
| **Syed Hamza Imran** | Lead Developer — ASP.NET Core 8 API, EF Core, SQL Server, JWT auth, AI integration |
| **Fareeha Fatima Khokhar** | Frontend Developer — Dashboard, Reports, Investments, Education, Settings |
| **Anamta Sajid** | Frontend Developer — Transactions, Budget, Savings, Debt, Notifications |
| **Safa Noor Fatima** | UI/UX & Documentation — Design system v3, Landing page v3, all documentation |

Aptech Computer Education — Malir Centre — ACCP Prime 2 — 2026

---

*Built with Angular 17 · ASP.NET Core 8 · Entity Framework Core 8 · SQL Server · Chart.js · lucide-angular · OpenRouter AI*
