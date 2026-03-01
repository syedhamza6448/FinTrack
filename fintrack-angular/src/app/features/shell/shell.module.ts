import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ShellComponent } from './shell.component';

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'dashboard',     loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'transactions',  loadChildren: () => import('../transactions/transactions.module').then(m => m.TransactionsModule) },
      { path: 'expenses',      loadChildren: () => import('../expenses/expenses.module').then(m => m.ExpensesModule) },
      { path: 'budget',        loadChildren: () => import('../budget/budget.module').then(m => m.BudgetModule) },
      { path: 'savings',       loadChildren: () => import('../savings/savings.module').then(m => m.SavingsModule) },
      { path: 'investments',   loadChildren: () => import('../investments/investments.module').then(m => m.InvestmentsModule) },
      { path: 'debt',          loadChildren: () => import('../debt/debt.module').then(m => m.DebtModule) },
      { path: 'reports',       loadChildren: () => import('../reports/reports.module').then(m => m.ReportsModule) },
      { path: 'notifications', loadChildren: () => import('../notifications/notifications.module').then(m => m.NotificationsModule) },
      { path: 'categories',    loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesModule) },
      { path: 'settings',      loadChildren: () => import('../settings/settings.module').then(m => m.SettingsModule) },
      { path: 'education',     loadChildren: () => import('../education/education.module').then(m => m.EducationModule) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [ShellComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ShellModule {}