import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData } from '../../core/models/models';

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
  error   = '';

  get currentUser() { return this.authService.getCurrentUser(); }
  get currency()    { return this.authService.userCurrency; }

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
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadDashboard(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error   = '';
    this.dashboardService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.data = data; this.loading = false; this.cdr.markForCheck(); },
        error: err  => { this.error = 'Failed to load dashboard data.'; this.loading = false; console.error(err); this.cdr.markForCheck(); }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  }

  formatPercent(n: number): string { return `${Math.round(n)}%`; }

  getDeltaClass(delta: number): string  { return delta >= 0 ? 'positive' : 'negative'; }
  getDeltaIcon(delta: number): string   { return delta >= 0 ? '↑' : '↓'; }
  absValue(n: number): number           { return Math.abs(n); }

  getBudgetClass(status: string): string {
    if (status === 'exceeded') return 'negative';
    if (status === 'warning')  return 'warning';
    return 'positive';
  }

  getGoalBarWidth(percent: number): string   { return `${Math.min(percent, 100)}%`; }
  getTransactionClass(type: string): string  { return type === 'Income' ? 'income' : 'expense'; }

  // Fixed: separate trackBy functions for items with and without id
  trackById(_: number, item: { id: number }): number         { return item.id; }
  trackByIndex(index: number): number                         { return index; }

  // Safe name split
  getFirstName(): string {
    return this.currentUser?.fullName?.split(' ')[0] ?? 'there';
  }
}