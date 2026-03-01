import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../core/services/api.services';
import { Notification } from '../../core/models/models';

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

  constructor(private notifService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadNotifications(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadNotifications(): void {
    this.loading = true;
    this.notifService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.notifications = Array.isArray(res) ? res : (res.notifications ?? res.items ?? []) ?? [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
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