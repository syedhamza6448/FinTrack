# FinTrack — Personal Finance Dashboard

> A full-stack personal finance web application built with **Angular 17** and **ASP.NET Core 8 Web API** — featuring JWT authentication, expense tracking, budget management, investment monitoring, debt tracking, savings goals, and financial reporting.

![Status](https://img.shields.io/badge/status-in%20development-B6FF3B?style=flat-square&labelColor=0C1A2B)
![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=flat-square&logo=angular&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core_8-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=flat-square&logo=csharp&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=flat-square&logo=microsoftsqlserver&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Visual Studio](https://img.shields.io/badge/Visual_Studio-5C2D91?style=flat-square&logo=visual-studio&logoColor=white)

---

## Overview

FinTrack is a full-stack personal finance dashboard built as an **Aptech eProject** submission. It solves the problem of scattered financial data — most people manage money across multiple apps, spreadsheets, and bank portals with no single overview. FinTrack brings everything together: every transaction you log feeds your budget progress, category breakdowns, and monthly reports automatically. Every deposit updates your savings goal in real time. Every payment reduces your debt balance on screen.

The project was built in three phases:

| Phase | What was built |
|---|---|
| **Phase 0** | Pure HTML / CSS / JavaScript prototype — all 16 pages, no backend |
| **Phase 1** | ASP.NET Core MVC with Razor Views, Entity Framework Core, SQL Server, ASP.NET Core Identity |
| **Phase 2 (current)** | Angular 17 SPA frontend consuming a dedicated ASP.NET Core 8 REST API over JWT |

The **current and active version** is Phase 2 — a fully decoupled architecture where Angular and the API are two separate applications that communicate exclusively through authenticated HTTP requests.

---

## Features

### Core Modules

| Module | Description |
|---|---|
| **Dashboard** | Overview with 4 stat cards (balance, income, expenses, savings), recent transactions, budget progress alerts, savings goal cards, and a 6-month income vs expense line chart |
| **Transactions** | Full income and expense ledger with type/category/date filters, search, pagination, and complete CRUD via slide-in modal |
| **Expenses** | Filtered view of Expense-type transactions with an additional category breakdown doughnut chart |
| **Budget** | Monthly budget per category with colour-coded progress bars (green → amber → red), overspend alerts, and a duplicate-budget guard |
| **Savings Goals** | Goal cards with progress ring, Lucide icon, colour accent, add-funds modal, and automatic status change to Completed when target is reached |
| **Investments** | Portfolio table with asset type, buy/current price, gain/loss computed client-side, and full CRUD |
| **Debt Management** | Debt cards with payoff progress bar, priority chips (High / Medium / Low), record-payment modal, and interest rate tracking |
| **Reports** | Monthly income vs expense bar chart, expense category doughnut, and net worth breakdown — all from live API data |
| **Notifications** | Auto-generated alerts for budget exceeded and goal completed events; mark individual or all as read; delete |
| **Categories** | Create and manage income/expense categories with a Lucide icon picker and colour swatch picker. Default categories are protected from deletion |
| **Settings** | Three tabs — Profile (name, occupation, date of birth), Preferences (currency, dark/light theme), Security (change password) |
| **Financial Education** | API-driven articles, learning modules, and guides plus four fully client-side calculators (Loan/EMI, Compound Interest, Savings Goal, Debt Payoff) |

### Public Pages

- **Landing Page** — dual navbar state: guests see Login / Get Started; authenticated users see Go to Dashboard
- **Register** — creates account, seeds 10 default categories, issues JWT
- **Login** — validates credentials, issues JWT

---

## Tech Stack

### Backend — ASP.NET Core 8 Web API

| Layer | Technology | Notes |
|---|---|---|
| Framework | ASP.NET Core 8 | Started from the Empty template — everything wired manually |
| Language | C# | |
| Pattern | RESTful Web API | No Razor Views — pure JSON responses |
| ORM | Entity Framework Core | Code-First migrations |
| Authentication | ASP.NET Core Identity + JWT Bearer | Token stored on the client, validated on every request |
| Database | SQL Server / SQL Server LocalDB | LocalDB ships with Visual Studio — no extra install needed |
| IDE | Visual Studio 2022 | |

### Frontend — Angular 17

| Layer | Technology | Notes |
|---|---|---|
| Framework | Angular 17+ | NgModule architecture — **no standalone components** |
| Language | TypeScript | |
| HTTP | `HttpClientModule` + `AuthInterceptor` | JWT auto-attached to every outgoing request |
| Forms | Angular Reactive Forms | `FormBuilder`, `FormGroup`, `Validators` throughout |
| Icons | `lucide-angular` | Zero emojis anywhere in the UI |
| Charts | Chart.js + `ng2-charts` | Dashboard and Reports pages |
| Styles | SCSS + CSS custom properties | Full design token system |
| Fonts | Outfit — Google Fonts | Weights 300–700 |

---

## Design System — v3 Navy + Electric Lime

All visual tokens are defined as CSS custom properties in `styles.scss` and referenced throughout — never hardcoded values in component styles.

### Brand Colours

| Role | Hex | Usage |
|---|---|---|
| Background | `#0C1A2B` | Deep navy — page background |
| Accent | `#B6FF3B` | Electric Lime — buttons, active states, focus rings |
| Accent text | `#0C1A2B` | Text placed on top of the lime accent |
| Positive | `#3ecf8e` | Income, profit, success states |
| Negative | `#f25c6e` | Expense, loss, error states |
| Warning | `#ffb547` | Caution, medium priority |

### Typography

Single typeface throughout: **Outfit** (Google Fonts), weights 300–700.

### Icons

All icons use `lucide-angular`. There are zero emojis in the codebase. Icon names are stored as kebab-case strings in the database (e.g. `"utensils"`, `"heart-pulse"`) and rendered directly in Angular templates:

```html
<lucide-icon [name]="category.icon" [size]="18"></lucide-icon>
```

---

## Project Structure

### Backend (ASP.NET Core)

```
FinTrack/
├── FinTrack.sln
└── FinTrack/
    ├── Program.cs                        # Entry point — CORS, Identity, JWT, EF Core registered here
    ├── appsettings.json                  # Connection string + JWT config
    ├── appsettings.Development.json
    │
    ├── Controllers/
    │   ├── AuthController.cs             # POST /api/auth/register  POST /api/auth/login
    │   ├── TransactionsController.cs     # GET POST PUT DELETE /api/transactions
    │   ├── BudgetController.cs           # GET POST PUT DELETE /api/budget
    │   ├── SavingsController.cs          # CRUD + PATCH /api/savings/:id/deposit
    │   ├── InvestmentsController.cs      # GET POST PUT DELETE /api/investments
    │   ├── DebtController.cs             # CRUD + PATCH /api/debt/:id/payment
    │   ├── CategoriesController.cs       # GET POST PUT DELETE /api/categories
    │   ├── NotificationsController.cs    # GET PATCH DELETE + unread-count
    │   ├── ReportsController.cs          # GET summary / category-breakdown / net-worth
    │   ├── SettingsController.cs         # GET + PUT profile / preferences / password
    │   └── EducationController.cs        # GET articles / modules / guides
    │
    ├── Models/
    │   ├── ApplicationUser.cs            # Extends IdentityUser
    │   ├── Category.cs
    │   ├── Transaction.cs
    │   ├── Budget.cs
    │   ├── Investment.cs
    │   ├── Debt.cs
    │   ├── SavingsGoal.cs
    │   ├── Notification.cs
    │   └── EducationArticle.cs
    │
    ├── DTOs/                             # Request and response data shapes per feature
    │   ├── Auth/
    │   ├── Transaction/
    │   ├── Budget/
    │   ├── Savings/
    │   ├── Investment/
    │   ├── Debt/
    │   ├── Category/
    │   └── Settings/
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
    │   │   └── core.module.ts
    │   │
    │   ├── shared/
    │   │   ├── components/
    │   │   │   ├── icon-picker/          # Dropdown with 44 searchable Lucide icons in 6 groups
    │   │   │   └── color-picker/         # 12 colour swatches with check-mark selection
    │   │   ├── utils/
    │   │   │   ├── date.util.ts          # today() · toISO() · fromISO()
    │   │   │   └── error.util.ts         # extractError(err) — normalises API errors to a string
    │   │   └── shared.module.ts          # Exports CommonModule, ReactiveFormsModule, LucideAngularModule
    │   │
    │   ├── models/                       # TypeScript interfaces matching API JSON shapes
    │   │   ├── user.model.ts
    │   │   ├── transaction.model.ts
    │   │   ├── budget.model.ts
    │   │   ├── savings.model.ts
    │   │   ├── investment.model.ts
    │   │   ├── debt.model.ts
    │   │   ├── category.model.ts
    │   │   └── notification.model.ts
    │   │
    │   ├── services/                     # One HTTP service per feature — components never use HttpClient directly
    │   │   ├── auth.service.ts
    │   │   ├── transaction.service.ts
    │   │   ├── budget.service.ts
    │   │   ├── savings.service.ts
    │   │   ├── investment.service.ts
    │   │   ├── debt.service.ts
    │   │   ├── category.service.ts
    │   │   ├── notification.service.ts
    │   │   ├── reports.service.ts
    │   │   ├── settings.service.ts
    │   │   └── education.service.ts
    │   │
    │   ├── shell/                        # Persistent app layout (only shown after login)
    │   │   ├── shell.component.ts        # Router outlet wrapper
    │   │   ├── sidebar/                  # Fixed left nav, collapses to icons on desktop
    │   │   ├── topbar/                   # Search bar, notification bell badge, user avatar
    │   │   └── bottom-nav/               # Mobile tab bar — hidden on desktop
    │   │
    │   ├── features/                     # One folder per page
    │   │   ├── auth/
    │   │   │   ├── login/
    │   │   │   └── register/
    │   │   ├── landing/
    │   │   ├── dashboard/
    │   │   ├── transactions/
    │   │   ├── expenses/
    │   │   ├── budget/
    │   │   ├── savings/
    │   │   ├── investments/
    │   │   ├── debt/
    │   │   ├── reports/
    │   │   ├── notifications/
    │   │   ├── categories/
    │   │   ├── settings/
    │   │   └── education/
    │   │
    │   ├── app-routing.module.ts
    │   ├── app.component.ts
    │   └── app.module.ts
    │
    ├── styles.scss                       # Global design tokens, shared component classes, animations
    └── index.html
```

---

## Database Schema

Nine tables total. Every table (except `EducationArticle`) carries a `UserId` foreign key so all queries are scoped to the authenticated user — no user can ever access another user's data.

```
ApplicationUser  (extends ASP.NET Identity IdentityUser)
    ├── has many ──▶  Categories
    ├── has many ──▶  Transactions
    ├── has many ──▶  Budgets
    ├── has many ──▶  Investments
    ├── has many ──▶  Debts
    ├── has many ──▶  SavingsGoals
    └── has many ──▶  Notifications

Category
    ├── has many ──▶  Transactions
    └── has many ──▶  Budgets
```

### Important design rules

- `Budget.SpentAmount` is **never stored** — calculated at query time by summing matching Transactions
- `SavingsGoal.ProgressPercent` is **never stored** — derived from `savedAmount / targetAmount`
- `Debt.PaidOffPercent` is **never stored** — derived from original vs remaining balance
- `Investment.TotalValue`, `GainLoss`, `GainLossPct` — **computed in Angular**, never sent to the API
- `Category.Icon` stores a Lucide icon name as a plain string (e.g. `"utensils"`) — rendered with `<lucide-icon [name]="category.icon">`

### Default categories seeded on registration

| Name | Type | Icon |
|---|---|---|
| Salary | Income | `wallet` |
| Freelance | Income | `laptop` |
| Food & Dining | Expense | `utensils` |
| Transport | Expense | `car` |
| Housing | Expense | `home` |
| Healthcare | Expense | `heart-pulse` |
| Entertainment | Expense | `clapperboard` |
| Shopping | Expense | `shopping-bag` |
| Education | Expense | `graduation-cap` |
| Savings Transfer | Expense | `piggy-bank` |

---

## API Reference

**Base URL:** `https://localhost:7xxx/api`

Every endpoint except `/api/auth/register` and `/api/auth/login` requires:
```
Authorization: Bearer <JWT token>
```

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register` · `POST /api/auth/login` |
| **Transactions** | `GET POST /api/transactions` · `GET PUT DELETE /api/transactions/:id` |
| **Budget** | `GET POST /api/budget` · `GET PUT DELETE /api/budget/:id` |
| **Savings** | `GET POST /api/savings` · `GET PUT DELETE /api/savings/:id` · `PATCH /api/savings/:id/deposit` |
| **Investments** | `GET POST /api/investments` · `GET PUT DELETE /api/investments/:id` |
| **Debt** | `GET POST /api/debt` · `GET PUT DELETE /api/debt/:id` · `PATCH /api/debt/:id/payment` |
| **Categories** | `GET POST /api/categories` · `GET PUT DELETE /api/categories/:id` |
| **Notifications** | `GET /api/notifications` · `GET /api/notifications/unread-count` · `PATCH /api/notifications/:id/read` · `PATCH /api/notifications/read-all` · `DELETE /api/notifications/:id` |
| **Reports** | `GET /api/reports/summary` · `GET /api/reports/category-breakdown` · `GET /api/reports/net-worth` |
| **Settings** | `GET /api/settings` · `PUT /api/settings/profile` · `PUT /api/settings/preferences` · `PUT /api/settings/password` |
| **Education** | `GET /api/education/articles` · `GET /api/education/articles/:id` · `GET /api/education/modules` · `GET /api/education/guides` |

---

## Getting Started

You need to run **two separate applications** simultaneously — the ASP.NET Core API and the Angular dev server. They run on different ports and talk to each other over HTTP.

---

### Prerequisites

Install everything below before starting:

| Tool | Version | Notes |
|---|---|---|
| [Visual Studio 2022](https://visualstudio.microsoft.com/) | Latest | Free Community edition works. Select the **ASP.NET and web development** workload during install |
| .NET 8 SDK | 8.0+ | Usually bundled with Visual Studio 2022. Verify: `dotnet --version` |
| SQL Server LocalDB | Any | Ships automatically with Visual Studio — no separate download needed |
| [Node.js](https://nodejs.org/) | 18+ | Verify: `node --version` |
| Angular CLI | Latest | `npm install -g @angular/cli` — verify: `ng version` |
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

Open `FinTrack/appsettings.json` and fill in both sections:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinTrackDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key":         "your-super-secret-key-must-be-at-least-32-characters-long",
    "Issuer":      "FinTrackAPI",
    "Audience":    "FinTrackClient",
    "ExpiryHours": 24
  }
}
```

> **SQL Server Express users:** replace `(localdb)\\mssqllocaldb` with `YOUR-PC-NAME\\SQLEXPRESS`

> **JWT Key:** must be at least 32 characters. Use any long random string for local dev. Never commit a production secret to source control.

#### 2c. Apply database migrations

Open **Package Manager Console** via **Tools → NuGet Package Manager → Package Manager Console** and run:

```powershell
Update-Database
```

You should see output ending in `Done.` — this creates the `FinTrackDb` database and all nine tables in LocalDB.

If you are on a fresh clone with no migration files yet, run these two commands in order:

```powershell
Add-Migration InitialCreate
Update-Database
```

#### 2d. Check CORS in `Program.cs`

The API must allow requests from Angular's dev server. Confirm these lines exist in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
```

And in the middleware pipeline (after `app.Build()`):

```csharp
app.UseCors("AngularDev");
```

#### 2e. Run the API

Press **F5** to run with the debugger, or **Ctrl+F5** to run without it. The API starts at `https://localhost:7xxx` — note your exact port number, you will need it in Step 3.

Confirm it is running by opening `https://localhost:7xxx/swagger` in your browser. You should see the Swagger UI listing all endpoints.

---

### Step 3 — Frontend Setup (Angular)

Open a **new terminal** for this — keep Visual Studio running in the background.

#### 3a. Navigate to the Angular folder

```bash
cd fintrack-angular
```

#### 3b. Install dependencies

```bash
npm install
```

This installs all packages from `package.json` including Angular, `lucide-angular`, Chart.js, and `ng2-charts`. Takes 1–2 minutes on first run.

#### 3c. Set the API base URL

Open `src/environments/environment.ts` and set `apiUrl` to match the port your API is running on:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7xxx/api'   // ← replace 7xxx with your actual backend port
};
```

If `src/environments/environment.development.ts` also exists, update it there too.

#### 3d. Start the dev server

```bash
ng serve
```

Angular compiles and serves at `http://localhost:4200`. Open that URL in your browser. Keep this terminal running — open a second one if you need to run other commands.

---

### Step 4 — Verify the Setup

With both applications running, go through this checklist:

1. Open `http://localhost:4200` — you should see the FinTrack landing page in navy and electric lime
2. Click **Get Started** and register a new account
3. After registering you are redirected to `/dashboard`
4. Go to **Categories** — you should see 10 default categories (Salary, Food & Dining, etc.) seeded by the API on registration
5. Create a **Transaction** — the category dropdown should populate and re-filter when you switch between Income and Expense
6. Create a **Budget** for the same category — the progress bar should immediately reflect any matching transactions

If all steps pass, the frontend and backend are correctly connected.

---

### Troubleshooting

**CORS error in browser console (`Access-Control-Allow-Origin`)**

The origin in `WithOrigins(...)` must exactly match `http://localhost:4200` — check the protocol (`http` not `https`) and remove any trailing slash. Restart the API after changing it.

**`401 Unauthorized` on every API call after logging in**

The JWT `Key` is either too short (minimum 32 characters) or was changed after a token was already issued. Open browser DevTools → Application → Local Storage → delete both `fintrack_token` and `fintrack_user` → log in again.

**`Update-Database` fails with "cannot open database"**

SQL Server LocalDB is not running. Open a Command Prompt (not PowerShell) and run:

```cmd
sqllocaldb start mssqllocaldb
```

Then re-run `Update-Database` in the Package Manager Console.

**`ng: command not found`**

Angular CLI is not installed globally:

```bash
npm install -g @angular/cli
```

**Angular compiles but the page is blank or broken**

Check the terminal running `ng serve` for TypeScript errors. The most common causes are a missing module import in a feature module, or a type mismatch between a service return type and a component property.

**API starts but Swagger shows no endpoints**

Ensure `app.UseSwagger()` and `app.UseSwaggerUI()` are called in `Program.cs` and the project is running in Development mode (the default when pressing F5 in Visual Studio).

---

## How Frontend and Backend Connect

Angular never touches the database directly. All data flows through the API over HTTP. Here is the full journey of a single user action:

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
POST https://localhost:7xxx/api/transactions
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
returns 201 Created  { "id": 42 }
        │
        ┌─────────────────────────────┐
        │ SUCCESS                     │ FAILURE
        ▼                             ▼
Angular closes modal           Angular keeps modal open
refreshes the list             displays error message inline
```

### What is stored in localStorage

| Key | Value |
|---|---|
| `fintrack_token` | The raw JWT string — sent as `Bearer` token on every request |
| `fintrack_user` | JSON stringified `{ id, firstName, lastName, email, currency, theme }` |

Both are written after a successful login or register. Both are deleted on logout.

---

## Functional Requirements

- **Expense Categorisation** — Predefined and custom categories with Lucide icon and colour per category
- **Budget Creation & Tracking** — Monthly budgets per category, real-time progress bars, overspend alerts, duplicate-budget guard
- **Goal Setting & Progress** — Savings goals with add-funds modal, progress tracking, auto-complete on target reached
- **Investment Tracking** — Portfolio with client-side gain/loss calculation (TotalValue, GainLoss, GainLossPct never stored)
- **Debt Management** — Loan tracking with payment recording, priority levels, and payoff progress bar
- **Reports & Analytics** — Monthly income vs expense chart, category doughnut, net worth from live API data
- **Notifications** — Backend auto-generates alerts for budget exceeded and goal completed events
- **Financial Education** — API-driven content plus four fully client-side calculators
- **Settings** — Profile edit, currency preference, dark/light theme toggle, change password

## Non-Functional Requirements

- **Responsive** — Desktop sidebar layout, auto-collapse on tablet, bottom tab navigation on mobile
- **Secure** — JWT on every request, all DB queries filtered by `userId`, HTTPS enforced, no derived values stored as columns
- **Accessible** — Lucide SVG icons, keyboard-navigable modals, WCAG-compliant colour contrast ratios
- **Performant** — EF Core queries always filtered by `userId`, client-side computation for Investment metrics, no redundant database columns

---

## Roadmap

- [x] Phase 0 — HTML/CSS/JS prototype, all 16 pages, Design System iterations v1 → v3
- [x] Phase 1 — ASP.NET Core MVC, Razor Views, EF Core, ASP.NET Identity
- [x] Phase 2 — Converted to REST API with 11 controllers and JWT authentication
- [x] Angular 17 project — NgModule architecture, shell layout, auth system, routing guards
- [x] All 14 feature pages built and connected to live API
- [x] Design System v3 — Navy `#0C1A2B` + Electric Lime `#B6FF3B`
- [x] Full `lucide-angular` integration — zero emojis in the entire codebase
- [x] Icon picker + colour picker shared components wired into Category and Savings Goal forms
- [x] Notification bell badge wired to live unread-count from API
- [x] Reports page Chart.js fully wired to live API data
- [x] Backend category seed updated to use Lucide icon name strings
- [ ] Production build and deployment (IIS / Azure App Service)

---

## Project Deliverables

| Deliverable | Status |
|---|---|
| Full-stack web application (Angular + ASP.NET Core) | ✅ In progress |
| All 14 pages implemented | ✅ Done |
| Database schema — 9 tables, EF Core migrations | ✅ Done |
| JWT authentication system | ✅ Done |
| REST API — 11 controllers | ✅ Done |
| Project report (problem definition, design specs, ER diagram) | ⬜ Pending |
| Flowcharts and Data Flow Diagrams | ⬜ Pending |
| Database schema `.sql` export | ⬜ Pending |
| Test data documentation | ⬜ Pending |
| Demo video (MP4) | ⬜ Pending |
| Hosted live URL | ⬜ Pending |

---

## Screenshots

> Add screenshots of key pages here after deployment.

| Dashboard | Reports | Investments |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## License

This project was created for educational purposes as part of the Aptech eProject program.

---

## Author

**Syed Hamza Imran**
Aptech Computer Education
eProject Submission — 2025–2026

---

*Built with Angular 17 · ASP.NET Core 8 · Entity Framework Core · SQL Server · Chart.js · lucide-angular*
