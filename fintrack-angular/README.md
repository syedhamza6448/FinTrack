# FinTrack — Angular Frontend

> The Angular 17 frontend for the FinTrack Personal Finance Dashboard. Built with NgModule architecture, Reactive Forms, Chart.js, and lucide-angular.

![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat-square&logo=sass&logoColor=white)

---

## Overview

This is the frontend application for FinTrack. It is a Single Page Application (SPA) that communicates exclusively with the ASP.NET Core 8 backend API over authenticated HTTP requests. Angular never touches the database directly — all data flows through the REST API.

> **The backend must be running before you start this app.** See the main `README.md` in the solution root for full setup instructions.

---

## Prerequisites

| Tool | Version | Command to verify |
|---|---|---|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Angular CLI | 17+ | `ng version` |

Install Angular CLI globally if not already installed:

```bash
npm install -g @angular/cli
```

---

## Installation

```bash
npm install
```

Installs all dependencies from `package.json` including Angular, `lucide-angular`, Chart.js, and all other packages. Takes 1–2 minutes on first run.

---

## Configuration

Open `src/environments/environment.ts` and set the API URL to match your backend port:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7030/api'   // match your backend port
};
```

> If you see `ERR_CERT_AUTHORITY_INVALID` in the browser console, change `https` to `http` here and also comment out `app.UseHttpsRedirection()` in the backend's `Program.cs`.

---

## Development Server

```bash
ng serve
```

Open your browser at `http://localhost:4200`. The app reloads automatically when you modify source files.

To run on a different port:

```bash
ng serve --port 4300
```

---

## Build

Development build:

```bash
ng build
```

Production build (optimised):

```bash
ng build --configuration production
```

Compiled output goes to the `dist/` directory.

---

## Project Structure

```
src/
├── app/
│   ├── core/                        # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   │   └── auth.guard.ts        # Redirects unauthenticated users to /auth/login
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts  # Attaches JWT Bearer token to every outgoing request
│   │   ├── models/
│   │   │   └── models.ts            # All TypeScript interfaces matching API JSON shapes
│   │   └── services/
│   │       ├── auth.service.ts      # Login, register, token storage, current user
│   │       ├── api.services.ts      # All feature HTTP services in one file
│   │       └── ai.service.ts        # AI endpoints — chat, parseTransaction, getMonthlyReport
│   │
│   ├── shared/                      # Reusable components and utilities
│   │   ├── components/
│   │   │   ├── dropdown/            # Custom dropdown replacing native select
│   │   │   └── app-icon/            # Lucide icon wrapper component
│   │   ├── utils/
│   │   │   ├── date.util.ts         # today(), toISO(), fromISO()
│   │   │   └── error.util.ts        # extractError(err) normalises API errors to string
│   │   └── shared.module.ts         # Re-exports CommonModule, ReactiveFormsModule, LucideAngularModule
│   │
│   └── features/                    # One lazy-loaded module per page
│       ├── auth/                    # /auth/login  /auth/register
│       ├── landing/                 # / (public marketing page)
│       ├── shell/                   # Persistent layout — sidebar, topbar, bottom-nav, AI chat panel
│       ├── dashboard/               # /dashboard
│       ├── transactions/            # /transactions  (includes AI natural language entry bar)
│       ├── expenses/                # /expenses
│       ├── budget/                  # /budget
│       ├── savings/                 # /savings
│       ├── investments/             # /investments
│       ├── debt/                    # /debt
│       ├── reports/                 # /reports  (includes AI Analysis tab)
│       ├── notifications/           # /notifications
│       ├── categories/              # /categories
│       ├── settings/                # /settings
│       └── education/               # /education
│
├── styles.scss                      # Global design tokens, CSS custom properties, shared classes
├── environments/
│   ├── environment.ts               # Development — apiUrl points to localhost backend
│   └── environment.prod.ts          # Production config
└── index.html
```

---

## Architecture

### NgModule (not standalone)

This project uses **NgModule architecture** throughout. There are no standalone components. Every component belongs to a feature module, and all feature modules are lazy-loaded via `loadChildren` in the router.

### Route Table

| Route | Component | Guard |
|---|---|---|
| `/` | LandingComponent | Public |
| `/auth/login` | LoginComponent | Public |
| `/auth/register` | RegisterComponent | Public |
| `/dashboard` | DashboardComponent | AuthGuard |
| `/transactions` | TransactionsComponent | AuthGuard |
| `/expenses` | ExpensesComponent | AuthGuard |
| `/budget` | BudgetComponent | AuthGuard |
| `/savings` | SavingsComponent | AuthGuard |
| `/investments` | InvestmentsComponent | AuthGuard |
| `/debt` | DebtComponent | AuthGuard |
| `/reports` | ReportsComponent | AuthGuard |
| `/notifications` | NotificationsComponent | AuthGuard |
| `/categories` | CategoriesComponent | AuthGuard |
| `/settings` | SettingsComponent | AuthGuard |
| `/education` | EducationComponent | AuthGuard |

### Authentication Flow

1. User logs in → API returns JWT token
2. Token stored in `localStorage` as `fintrack_token`
3. User object stored in `localStorage` as `fintrack_user`
4. `AuthInterceptor` clones every outgoing HTTP request and appends `Authorization: Bearer <token>`
5. On `401` response — interceptor clears localStorage and redirects to `/auth/login`
6. On logout — both localStorage keys are deleted and user is redirected to `/`

### HTTP Services

Components never use `HttpClient` directly. All API calls go through services in `core/services/`:

```typescript
// Correct — call through the service
this.transactionService.getAll(params).subscribe(...)

// Never do this in a component
this.http.get('/api/transactions').subscribe(...)
```

### Forms

All forms use **Angular Reactive Forms** (`FormBuilder`, `FormGroup`, `Validators`). Template-driven forms are not used anywhere in this project.

### Unsubscribe Pattern

All components that subscribe to Observables use `takeUntil(this.destroy$)` to prevent memory leaks:

```typescript
private destroy$ = new Subject<void>();

ngOnInit(): void {
  this.someService.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { ... });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## Design System

All styles use CSS custom properties defined in `styles.scss`. Never hardcode hex values in component SCSS files.

### Key CSS Tokens

```scss
/* Backgrounds */
--bg-void:        #070F1A;   /* Deepest background */
--bg-base:        #0C1A2B;   /* Deep navy — main page background */
--bg-raised:      #112236;   /* Cards, modals, sidebar */
--bg-float:       #162B43;   /* Dropdowns, tooltips */

/* Accent */
--accent:         #B6FF3B;   /* Electric lime — buttons, active states */
--accent-dim:     rgba(182,255,59,0.10); /* Focus rings, active nav bg */
--text-inverse:   #0C1A2B;   /* Text ON lime buttons — always navy */

/* Semantic colours */
--positive:       #3ECF8E;   /* Income, success, goal completion */
--negative:       #F25C6E;   /* Expense, error, budget exceeded */
--warning:        #FFB547;   /* 80% budget threshold, caution */
--info:           #5B9CF6;   /* Savings bars, informational */

/* Borders */
--glass-border:   rgba(255,255,255,0.07);  /* Card and input borders */
--glass-border-h: rgba(182,255,59,0.25);   /* Hover and focus border colour */
```

### Component Rules

- **Primary button:** `background: var(--accent); color: var(--text-inverse)`
- **Input focus:** `border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim)`
- **Active nav item:** `color: var(--accent); background: var(--accent-dim)`
- **Cards:** `background: var(--bg-raised); border: 1px solid var(--glass-border)`
- **Font:** Outfit (Google Fonts) — weights 300–900, loaded in `index.html`
- **Icons:** `lucide-angular` only — zero emojis in the entire codebase

---

## AI Features

### Floating Chat Panel

A sparkle button fixed to the bottom-right of every authenticated page opens the AI chat panel. Implemented in `shell.component.ts` so it is available on all pages without any per-page wiring.

### Natural Language Transaction Entry

Above the Add Transaction form there is an AI bar. Type a sentence like *"Spent 5000 on groceries today"* and click Auto-fill — the form fields populate automatically via `POST /api/ai/parse-transaction`.

### Monthly AI Report

On the Reports page there is an **AI Analysis** tab. Click **Generate Report** to get a 4-paragraph AI-written analysis of the selected month — overview, what went well, needs attention, and one actionable tip for next month.

### Smart Notifications

When a transaction pushes a category over 80% or 100% of its budget, the backend automatically generates an AI-written notification. No frontend action needed — it appears in the Notifications page on next load.

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `@angular/core` | Angular framework |
| `@angular/router` | Routing and lazy loading |
| `@angular/forms` | Reactive Forms |
| `lucide-angular` | Icon components — kebab-case icon names |
| `chart.js` | Charts on Dashboard and Reports pages |
| `ng2-charts` | Angular wrapper for Chart.js |

---

## localStorage Keys

| Key | Value | Set when |
|---|---|---|
| `fintrack_token` | Raw JWT string | On login / register |
| `fintrack_user` | JSON `{ id, firstName, lastName, email, currency, theme }` | On login / register |

Both keys are deleted on logout.

---

## Demo Credentials

| Email | Password | Data |
|---|---|---|
| `hamza@fintrack.demo` | `Demo@123!` | Full dataset — all modules populated |
| `fareeha@fintrack.demo` | `Demo@456!` | Budget-focused — several categories exceeded |
| `anamta@fintrack.demo` | `Demo@789!` | Savings and investments focused |
| `test@fintrack.demo` | `Test@000!` | Blank account — onboarding demo |

---

## Troubleshooting

**Blank page or TypeScript errors after `ng serve`**

Check the terminal for compilation errors. Common causes are a missing module import in a feature module or a type mismatch between a service return type and a component property.

**`ERR_CERT_AUTHORITY_INVALID` in browser console**

Change `apiUrl` in `environment.ts` from `https://` to `http://`. Also comment out `app.UseHttpsRedirection()` in the backend `Program.cs`.

**`401 Unauthorized` on all API calls after logging in**

Token is expired or invalid. Open DevTools → Application → Local Storage → delete `fintrack_token` and `fintrack_user` → log in again.

**`NullInjectorError: No provider for XService`**

The service is not decorated with `@Injectable({ providedIn: 'root' })` or is not listed in the `providers` array of the relevant module.

**Charts not rendering / canvas already in use error**

`Chart.js` instances must be destroyed in `ngOnDestroy`. Ensure `chart.destroy()` is called before the component is re-initialised.

**`ng: command not found`**

```bash
npm install -g @angular/cli
```

---

*Part of the FinTrack eProject — Aptech Computer Education · Malir Centre · ACCP Prime 2 · 2026*