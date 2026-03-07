import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService, ExpenseService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData, CategoryReport } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  data: DashboardData | null = null;
  loading = true;
  error = '';
  topCategories: CategoryReport[] = [];

  pieChartData: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] } = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' as const } }
  };

  get currentUser() { return this.authService.getCurrentUser(); }
  get currentMonthValue(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  get currency() { return this.authService.userCurrency; }

  get budgetRiskAlerts() {
    if (!this.data?.budgetAlerts?.length) return [];
    return this.data.budgetAlerts.filter(b => b.percentUsed >= 80 && b.percentUsed < 100);
  }

  get upcomingGoals() {
    if (!this.data?.savingsGoals?.length) return [];
    return this.data.savingsGoals.filter(g => {
      if (!g.targetDate || g.status !== 'Active') return false;
      const days = this.daysUntil(g.targetDate);
      return days >= 3 && days <= 5;
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get currentMonth(): string {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  constructor(
    private dashboardService: DashboardService,
    private expenseService: ExpenseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { this.loadDashboard(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';
    const month = this.currentMonthValue;
    forkJoin({
      dashboard: this.dashboardService.get(),
      topCategories: this.expenseService.getTopCategories(month)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.data = res.dashboard;
          this.topCategories = res.topCategories ?? [];
          this.updatePieChart();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: err => {
          this.error = 'Failed to load dashboard data.';
          this.loading = false;
          console.error(err);
          this.cdr.markForCheck();
        }
      });
  }

  private daysUntil(dateStr: string): number {
    const target = new Date(dateStr);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  private updatePieChart(): void {
    const defaultColors = ['#f44336', '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#00bcd4', '#795548'];
    this.pieChartData = {
      labels: this.topCategories.map(c => c.categoryName ?? ''),
      datasets: [{
        data: this.topCategories.map(c => c.total ?? 0),
        backgroundColor: this.topCategories.map((cat, i) => cat.color ?? defaultColors[i % defaultColors.length])
      }]
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  }

  formatPercent(n: number): string { return `${Math.round(n)}%`; }

  getDeltaClass(delta: number): string { return delta >= 0 ? 'positive' : 'negative'; }
  getDeltaIcon(delta: number): string { return delta >= 0 ? '↑' : '↓'; }
  absValue(n: number): number { return Math.abs(n); }

  getBudgetClass(status: string): string {
    if (status === 'exceeded') return 'negative';
    if (status === 'warning') return 'warning';
    return 'positive';
  }

  getGoalBarWidth(percent: number): string { return `${Math.min(percent, 100)}%`; }
  getTransactionClass(type: string): string { return type === 'Income' ? 'income' : 'expense'; }

  // Fixed: separate trackBy functions for items with and without id
  trackById(_: number, item: { id: number }): number { return item.id; }
  trackByIndex(index: number): number { return index; }

  // Safe name split
  getFirstName(): string {
    return this.currentUser?.fullName?.split(' ')[0] ?? 'there';
  }
}