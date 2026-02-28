import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ReportsService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading           = true;
  activeTab         = 'monthly';
  selectedYear      = new Date().getFullYear();
  selectedMonth     = this.currentMonthValue();

  monthlyTrend:          any[] = [];
  topExpenseCategories:  any[] = [];
  topIncomeCategories:   any[] = [];

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  get currency() { return this.authService.userCurrency; }

  get monthlyIncome(): number {
    const current = this.monthlyTrend.find(m => m.month === this.selectedMonth);
    return current?.income ?? 0;
  }
  get monthlyExpense(): number {
    const current = this.monthlyTrend.find(m => m.month === this.selectedMonth);
    return current?.expense ?? 0;
  }
  get monthlyNet():   number { return this.monthlyIncome - this.monthlyExpense; }
  get savingsRate():  number { return this.monthlyIncome > 0 ? (this.monthlyNet / this.monthlyIncome) * 100 : 0; }

  get maxTrendValue(): number {
    if (!this.monthlyTrend.length) return 1;
    return Math.max(...this.monthlyTrend.map(m => Math.max(m.income ?? 0, m.expense ?? 0)), 1);
  }

  constructor(
    private reportsService: ReportsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void { this.loadReport(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadReport(): void {
    this.loading = true;
    forkJoin({
      monthly:        this.reportsService.getMonthly(this.selectedYear),
      expenseCategories: this.reportsService.getByCategory(this.selectedMonth, 'Expense'),
      incomeCategories:  this.reportsService.getByCategory(this.selectedMonth, 'Income')
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.monthlyTrend         = res.monthly ?? [];
        this.topExpenseCategories = res.expenseCategories ?? [];
        this.topIncomeCategories  = res.incomeCategories ?? [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilterChange(): void { this.loadReport(); }
  setTab(tab: string): void { this.activeTab = tab; }

  getBarHeight(value: number): string {
    return `${Math.round((value / this.maxTrendValue) * 100)}%`;
  }

  getCategoryBarWidth(pct: number): string { return `${Math.min(pct, 100)}%`; }

  getCategoryColor(i: number): string {
    const colors = ['var(--negative)', 'var(--accent)', 'var(--info)', 'var(--positive)', 'var(--purple)'];
    return colors[i % colors.length];
  }

  getMonthLabel(m: any): string {
    if (!m?.month) return '';
    const [y, mo] = m.month.split('-');
    return new Date(+y, +mo - 1).toLocaleString('default', { month: 'short' });
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: this.currency,
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n ?? 0);
  }

  private currentMonthValue(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  trackByIndex(i: number): number { return i; }
}