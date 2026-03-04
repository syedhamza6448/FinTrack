import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { DashboardService, NotificationService, TransactionService } from '../../core/services/api.services';
import { DashboardData, Notification, Transaction } from '../../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];
  loading                        = true;
  filterType                     = '';

  get unreadCount() { return this.notifications.filter(n => !n.isRead).length; }
  get filtered() {
    if (!this.filterType) return this.notifications;
    return this.notifications.filter(n => n.type === this.filterType);
  }

  constructor(
    private notifService: NotificationService,
    private dashboardService: DashboardService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { this.loadNotifications(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadNotifications(): void {
    this.loading = true;

    forkJoin({
      apiNotifs: this.notifService.getAll(),
      dashboard: this.dashboardService.get(),
      transactions: this.transactionService.getAll({ page: 1, pageSize: 10 })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ apiNotifs, dashboard, transactions }) => {
          const baseItems = (apiNotifs?.items ?? []) as Notification[];

          const derived = [
            ...this.buildBudgetNotifications(dashboard),
            ...this.buildSavingsNotifications(dashboard),
            ...this.buildTransactionNotifications(transactions?.items ?? [])
          ];

          this.notifications = [...baseItems, ...derived].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
  }

  private buildBudgetNotifications(data: DashboardData | null): Notification[] {
    if (!data?.budgetAlerts?.length) return [];
    const now = new Date().toISOString();

    return data.budgetAlerts.map((b, idx) => {
      const over = b.status === 'exceeded' || b.percentUsed >= 100;
      const near = !over && b.percentUsed >= 80;
      const title = over
        ? `Budget exceeded: ${b.categoryName}`
        : `Budget nearing limit: ${b.categoryName}`;

      const message = over
        ? `${b.categoryName} has exceeded its budget. Spent ${b.spent} of ${b.budgeted}.`
        : `${b.categoryName} has used ${Math.round(b.percentUsed)}% of its budget.`;

      return {
        id: 10_000 + idx,
        title,
        message,
        type: 'budget',
        isRead: false,
        createdAt: now
      } as Notification;
    });
  }

  private buildSavingsNotifications(data: DashboardData | null): Notification[] {
    if (!data?.savingsGoals?.length) return [];
    const now = new Date().toISOString();

    return data.savingsGoals.flatMap((g, idx) => {
      const notifs: Notification[] = [];

      if (g.status === 'Completed') {
        notifs.push({
          id: 20_000 + idx * 2,
          title: `Goal completed: ${g.name}`,
          message: `You reached your savings goal of ${g.targetAmount}.`,
          type: 'savings',
          isRead: false,
          createdAt: now
        });
      } else if (g.status === 'Active' && g.targetDate) {
        const days = this.daysUntil(g.targetDate);
        if (days >= 0 && days <= 5) {
          notifs.push({
            id: 20_000 + idx * 2 + 1,
            title: `Goal due soon: ${g.name}`,
            message: `${g.name} is due in ${days} day${days === 1 ? '' : 's'}.`,
            type: 'savings',
            isRead: false,
            createdAt: now
          });
        }
      }

      return notifs;
    });
  }

  private buildTransactionNotifications(items: Transaction[]): Notification[] {
    const now = new Date().toISOString();
    return items.slice(0, 10).map(txn => ({
      id: 30_000 + txn.id,
      title: txn.type === 'Income' ? 'Income recorded' : 'Expense recorded',
      message: `${txn.description} • ${txn.category?.name}`,
      type: 'transaction',
      isRead: false,
      createdAt: txn.createdAt || now
    }));
  }

  private daysUntil(dateStr: string): number {
    const target = new Date(dateStr);
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  markRead(n: Notification): void {
    if (n.isRead) return;
    this.notifService.markRead(n.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: () => n.isRead = true, error: () => {} });
  }

  markAllRead(): void {
    this.notifService.markAllRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.notifications.forEach(n => n.isRead = true),
        error: () => {}
      });
  }

  deleteNotif(id: number): void {
    this.notifService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.notifications = this.notifications.filter(n => n.id !== id),
        error: () => {}
      });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      budget: 'target', savings: 'piggy-bank', transaction: 'banknote',
      investment: 'trending-up', debt: 'credit-card', system: 'settings', alert: 'alert-triangle'
    };
    return icons[type?.toLowerCase()] ?? 'bell';
  }

  getTypeClass(type: string): string {
    const map: Record<string, string> = {
      budget: 'warning', savings: 'accent', transaction: 'info',
      investment: 'positive', debt: 'negative', alert: 'warning', system: 'neutral'
    };
    return map[type?.toLowerCase()] ?? 'neutral';
  }

  formatDate(d: string): string {
    const date = new Date(d);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
}