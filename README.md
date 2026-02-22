# FinTrack — Personal Finance Dashboard

> A comprehensive, beautifully designed personal finance web application built with **ASP.NET Core** and **Razor Views** — featuring expense tracking, budget management, investment monitoring, debt tracking, and financial reporting.

![Status](https://img.shields.io/badge/status-in%20development-f43f5e?style=flat-square)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=flat-square&logo=csharp&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Visual Studio](https://img.shields.io/badge/Visual_Studio-5C2D91?style=flat-square&logo=visual-studio&logoColor=white)

---

## Overview

FinTrack is a full-stack web application that empowers individuals to take full control of their personal finances. Many people struggle to track spending, monitor investments, and reach savings goals without a centralized tool. FinTrack solves this by bringing income tracking, expense categorization, budget management, investment monitoring, debt tracking, and financial reporting together into a single, intuitive platform.

The backend is powered by **ASP.NET Core (Empty template)** using the **MVC pattern** with **Razor Views** for server-side rendered pages. The frontend uses **Tailwind CSS**, **GSAP**, and **Chart.js** for a polished, animated UI with full dark/light mode support. An **Angular** migration path is planned for a future release.

This project was developed as part of the **Aptech eProject** program — a structured, real-world learning initiative designed to simulate professional software development.

---

## Features

### Core Modules

| Module | Description |
|---|---|
| **Dashboard** | Real-time financial overview with charts, stat cards, recent transactions, and goal progress |
| **Transactions** | Full income and expense ledger with filtering, search, and CSV export |
| **Budget** | Monthly budget creation and real-time tracking per spending category with visual progress bars |
| **Expense Categorization** | Auto-categorized expenses with trend charts and monthly comparison |
| **Investments** | Portfolio tracker with holdings table, asset allocation chart, and performance analytics |
| **Debt Management** | Loan tracker with payment schedules, payoff projections, and priority indicators |
| **Savings & Goals** | Goal creation with progress tracking for short-term and long-term financial targets |
| **Reports & Analytics** | Annual income vs expense charts, net worth growth, and basic PAYE tax estimation |
| **Notifications & Alerts** | Real-time alerts for budget overruns, bill due dates, and savings opportunities |
| **Financial Education** | Articles, guides, and three working financial calculators |
| **Settings** | Profile management, theme switching, notification preferences, and security options |
| **Sitemap** | Visual application structure with a full page directory |

### Public Pages

- **Landing Page** — Product overview with feature highlights and call-to-action
- **Login / Register / Forgot Password** — Full authentication flow with ASP.NET Core Identity

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core (Empty Template) |
| Language | C# |
| Pattern | MVC (Model-View-Controller) |
| Views | Razor Views (`.cshtml`) |
| ORM | Entity Framework Core |
| Auth | ASP.NET Core Identity |
| Database | SQL Server / LocalDB |
| IDE | Visual Studio 2022 |

### Frontend

| Layer | Technology |
|---|---|
| Templating | Razor Views + Tag Helpers |
| Styling | Tailwind CSS (CDN), Custom CSS Variables |
| Scripting | Vanilla JavaScript (ES6+) |
| Charts | Chart.js v4 |
| Animations | GSAP 3 (ScrollTrigger, ScrollToPlugin) |
| Icons | Lucide (inline SVG) |
| Fonts | Syne (headings), Outfit (body) — Google Fonts |

> **Planned:** Angular frontend with ASP.NET Core Web API backend (RESTful).

---

## Project Structure

```
FinTrack/
│
├── FinTrack.sln                          # Visual Studio solution file
│
└── FinTrack/                             # ASP.NET Core project
    │
    ├── Program.cs                        # App entry point & middleware pipeline
    ├── appsettings.json                  # App configuration
    ├── appsettings.Development.json      # Dev environment overrides
    │
    ├── Controllers/                      # MVC Controllers
    │   ├── HomeController.cs             # Landing page & dashboard
    │   ├── AccountController.cs          # Login, register, forgot password
    │   ├── TransactionsController.cs
    │   ├── BudgetController.cs
    │   ├── ExpensesController.cs
    │   ├── InvestmentsController.cs
    │   ├── DebtController.cs
    │   ├── SavingsController.cs
    │   ├── ReportsController.cs
    │   ├── NotificationsController.cs
    │   ├── EducationController.cs
    │   └── SettingsController.cs
    │
    ├── Models/                           # Data models & ViewModels
    │   ├── User.cs
    │   ├── Transaction.cs
    │   ├── Budget.cs
    │   ├── BudgetCategory.cs
    │   ├── Investment.cs
    │   ├── Debt.cs
    │   ├── SavingsGoal.cs
    │   ├── Notification.cs
    │   └── ViewModels/
    │       ├── DashboardViewModel.cs
    │       ├── TransactionViewModel.cs
    │       └── ...
    │
    ├── Views/                            # Razor Views (.cshtml)
    │   ├── Shared/
    │   │   ├── _Layout.cshtml            # Master layout (sidebar + topbar)
    │   │   ├── _Sidebar.cshtml           # Sidebar partial view
    │   │   ├── _Topbar.cshtml            # Topbar partial view
    │   │   └── _ValidationScripts.cshtml
    │   ├── Home/
    │   │   ├── Index.cshtml              # Landing page
    │   │   └── Dashboard.cshtml
    │   ├── Account/
    │   │   ├── Login.cshtml
    │   │   ├── Register.cshtml
    │   │   └── ForgotPassword.cshtml
    │   ├── Transactions/
    │   │   └── Index.cshtml
    │   ├── Budget/
    │   │   └── Index.cshtml
    │   ├── Expenses/
    │   │   └── Index.cshtml
    │   ├── Investments/
    │   │   └── Index.cshtml
    │   ├── Debt/
    │   │   └── Index.cshtml
    │   ├── Savings/
    │   │   └── Index.cshtml
    │   ├── Reports/
    │   │   └── Index.cshtml
    │   ├── Notifications/
    │   │   └── Index.cshtml
    │   ├── Education/
    │   │   └── Index.cshtml
    │   └── Settings/
    │       └── Index.cshtml
    │
    ├── Data/                             # EF Core DbContext
    │   └── AppDbContext.cs
    │
    ├── Migrations/                       # EF Core migrations (auto-generated)
    │
    └── wwwroot/                          # Static files served publicly
        ├── css/
        │   └── style.css                 # Global design system & CSS variables
        ├── js/
        │   ├── main.js                   # Theme toggle, sidebar, GSAP loader
        │   ├── layout.js                 # Layout helpers
        │   ├── animations.js             # GSAP animation system
        │   └── icons.js                  # Lucide SVG icon library
        └── lib/                          # Vendor libraries (if bundled locally)
```

---

## Getting Started

### Prerequisites

Ensure the following are installed before running the project:

- [Visual Studio 2022](https://visualstudio.microsoft.com/) — Community edition is free. During installation, select the **ASP.NET and web development** workload.
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) or later — usually bundled with Visual Studio 2022.
- **SQL Server LocalDB** — ships automatically with Visual Studio. No separate installation needed for development.
- [Git](https://git-scm.com/) — for cloning the repository.

---

### Installation & Setup

**1. Clone the repository**

Open a terminal and run:

```bash
git clone https://github.com/your-username/fintrack.git
```

Or in Visual Studio, go to **File → Clone Repository** and paste the URL.

---

**2. Open the solution**

Navigate to the cloned folder and double-click `FinTrack.sln`, or open Visual Studio and go to **File → Open → Project/Solution** and select `FinTrack.sln`.

---

**3. Configure the database connection**

Open `appsettings.json` and update the connection string to match your environment:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinTrackDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

> If you are using SQL Server Express instead of LocalDB, replace the server value with `your-pc-name\\SQLEXPRESS`.

---

**4. Apply database migrations**

Open the **Package Manager Console** in Visual Studio:

```
Tools → NuGet Package Manager → Package Manager Console
```

Then run:

```powershell
Update-Database
```

This will scaffold the database and all tables based on the Entity Framework Core migrations.

---

**5. Run the application**

Press **F5** to run with the debugger, or **Ctrl + F5** to run without it. Visual Studio will build the project and launch the app in your default browser at `https://localhost:xxxx`.

---

## Design System

FinTrack uses a custom CSS variable-based design system defined in `wwwroot/css/style.css`, supporting both dark and light modes.

### Color Palette

| Token | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| `--bg-dark` | `#0d0d0f` | `#f5f5f7` | Page background |
| `--bg-card` | `#151518` | `#ffffff` | Card backgrounds |
| `--accent` | `#f43f5e` | `#f43f5e` | Primary accent (Rose) |
| `--accent-light` | `#fb7185` | `#fb7185` | Hover states |
| `--text-primary` | `#f1f1f3` | `#0d0d0f` | Body text |
| `--text-secondary` | `#7c7c8a` | `#6b6b7b` | Muted text |

### Typography

- **Headings** — [Syne](https://fonts.google.com/specimen/Syne) (700–800 weight) — editorial, bold
- **Body** — [Outfit](https://fonts.google.com/specimen/Outfit) (300–600 weight) — clean, geometric

### Theme Toggle

Theme preference is persisted via `localStorage`. The toggle is available in the topbar on every page and on the landing/auth pages.

---

## Functional Requirements

Based on the project SRS, FinTrack implements the following:

- **Expense Categorization** — Predefined and custom categories with visual breakdowns
- **Budget Creation & Tracking** — Monthly budgets per category with real-time visual indicators and overspend alerts
- **Goal Setting & Progress Tracking** — Short and long-term savings goals with progress bars
- **Investment Tracking** — Portfolio performance, asset allocation, and holdings management
- **Debt Management** — Loan tracking with payment schedules and projected payoff dates
- **Spending Insights & Trends** — Bar charts, line charts, doughnut charts, and category comparisons
- **Tax Estimation** — Basic PAYE tax estimation from annual income and expense data
- **Financial Reports** — Monthly, quarterly, and annual summary views
- **Notifications & Alerts** — Budget exceeded, bill reminders, savings opportunities, and investment updates
- **Financial Education** — In-app articles, guides, and calculators (savings rate, debt payoff, investment return)
- **Settings & Preferences** — Profile management, theme, currency, language, and security settings

---

## Non-Functional Requirements

- **Responsive** — Works on desktop, tablet, and mobile viewports
- **Accessible** — Legible fonts, clear contrast ratios, and keyboard-navigable elements
- **Performant** — Efficient EF Core queries, CDN-loaded frontend libraries, minimal asset weight
- **Secure** — ASP.NET Core Identity for authentication, password hashing, anti-forgery tokens on all forms, HTTPS enforced
- **Browser Compatible** — Tested on Chrome, Firefox, Edge, and Safari

---

## Screenshots

> Add screenshots of key pages here after deployment.

| Dashboard | Reports | Investments |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## Roadmap

- [x] Frontend UI template (HTML/CSS/JS — all 16 pages)
- [ ] ASP.NET Core project setup (Empty template + MVC)
- [ ] Razor Views migration from static HTML templates
- [ ] EF Core models and `AppDbContext`
- [ ] SQL Server database schema and migrations
- [ ] ASP.NET Core Identity (registration, login, roles)
- [ ] Controller logic and ViewModel data binding
- [ ] API endpoints for Chart.js dynamic data
- [ ] Angular frontend — replaces Razor Views (future)
- [ ] Deployment to IIS or Azure App Service
- [ ] PDF report export
- [ ] Multi-currency real-time conversion

---

## Project Deliverables

As per the eProject submission requirements:

- [x] Frontend UI template (all 16 pages)
- [ ] Full-stack ASP.NET Core application
- [ ] Project report (problem definition, design specs, diagrams, DB design)
- [ ] Flowcharts and Data Flow Diagrams
- [ ] Database schema (`.sql` scripts)
- [ ] Test data documentation
- [ ] Installation guide
- [ ] Demo video (MP4)
- [ ] Hosted live URL

---

## License

This project was created for educational purposes as part of the Aptech eProject program.

---

## Author

**John Doe**
Aptech Computer Education
eProject Submission — 2025

---

*Built with ASP.NET Core, C#, Razor Views, Tailwind CSS, GSAP, and Chart.js*
