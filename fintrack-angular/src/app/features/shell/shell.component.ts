import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, BudgetService, SavingsService } from '../../core/services/api.services';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  sidebarOpen     = false;
  sidebarCollapsed = false;
  moreMenuOpen    = false;
  currentRoute    = '';
  unreadCount     = 0;
  isDark          = true;
  tooltipLabel    = '';
  tooltipVisible  = false;
  tooltipX        = 0;
  tooltipY        = 0;

  navItems = [
    { path: '/dashboard',     label: 'Dashboard',     icon: 'grid',         group: 'overview' },
    { path: '/transactions',  label: 'Transactions',  icon: 'swap',         group: 'overview' },
    { path: '/reports',       label: 'Reports',       icon: 'bar-chart',    group: 'overview' },
    { path: '/expenses',      label: 'Expenses',      icon: 'wallet',       group: 'manage' },
    { path: '/budget',        label: 'Budget',        icon: 'target',       group: 'manage' },
    { path: '/savings',       label: 'Savings',       icon: 'piggy',        group: 'manage' },
    { path: '/investments',   label: 'Investments',   icon: 'trending-up',  group: 'manage' },
    { path: '/debt',          label: 'Debt',          icon: 'credit-card',  group: 'manage' },
    { path: '/categories',    label: 'Categories',    icon: 'tag',          group: 'system' },
    { path: '/notifications', label: 'Notifications', icon: 'bell',         group: 'system' },
    { path: '/education',     label: 'Education',     icon: 'book',         group: 'system' },
    { path: '/settings',      label: 'Settings',      icon: 'settings',     group: 'system' },
  ];

  bottomNavItems = [
    { path: '/dashboard',    label: 'Home',    icon: 'grid' },
    { path: '/transactions', label: 'Txns',    icon: 'swap' },
    { path: '/budget',       label: 'Budget',  icon: 'target' },
    { path: '/savings',      label: 'Savings', icon: 'piggy' },
    { path: '/settings',     label: 'More',    icon: 'more' },
  ];

  get overviewItems() { return this.navItems.filter(i => i.group === 'overview'); }
  get manageItems()   { return this.navItems.filter(i => i.group === 'manage'); }
  get systemItems()   { return this.navItems.filter(i => i.group === 'system'); }
  get currentUser()   { return this.authService.getCurrentUser(); }

  get pageTitle(): string {
    const item = this.navItems.find(i => this.currentRoute.startsWith(i.path));
    return item?.label ?? 'FinTrack';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private notifService: NotificationService,
    private budgetService: BudgetService,
    private savingsService: SavingsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
      this.sidebarOpen  = false;
      this.moreMenuOpen = false;
    });

    this.currentRoute = this.router.url;
    this.isDark = this.authService.userTheme === 'dark';
    this.applyTheme();
    this.loadUnreadCount();

    // Run smart notification checks after 2s (let the app settle)
    setTimeout(() => this.checkSmartNotifications(), 2000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActive(path: string): boolean {
    return this.currentRoute.startsWith(path);
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }

  toggleSidebarCollapse(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  showTooltip(label: string, event: MouseEvent): void {
    if (!this.sidebarCollapsed) return;
    this.tooltipLabel = label;
    this.tooltipVisible = true;
    const el = event.target as HTMLElement;
    const rect = el.closest?.('.nav-item')?.getBoundingClientRect?.() ?? el.getBoundingClientRect();
    this.tooltipX = rect.right + 8;
    this.tooltipY = rect.top + rect.height / 2;
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
  }

  logout(): void { this.authService.logout(); }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
  }

  private loadUnreadCount(): void {
    this.notifService.getUnreadCount().pipe(takeUntil(this.destroy$)).subscribe({
      next: res => this.unreadCount = res.count,
      error: () => {}
    });
  }

  private checkSmartNotifications(): void {
    this.checkBudgetAlerts();
    this.checkSavingsDeadlines();
  }

  private checkBudgetAlerts(): void {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.budgetService.getAll(month).pipe(takeUntil(this.destroy$)).subscribe({
      next: budgets => {
        if (!Array.isArray(budgets)) return;
        budgets.forEach(b => {
          const pct = b.percentUsed ?? 0;
          const name = b.category?.name ?? 'Budget';
          if (pct >= 90) {
            this.toastService.show(
              'danger',
              'Budget Exceeded!',
              `${name} is at ${Math.round(pct)}% — you've nearly exhausted your budget.`,
              'alert-circle'
            );
          } else if (pct >= 80) {
            this.toastService.show(
              'warning',
              'Budget Alert',
              `${name} is at ${Math.round(pct)}% of your monthly budget.`,
              'alert-triangle'
            );
          }
        });
      },
      error: () => {}
    });
  }

  private checkSavingsDeadlines(): void {
    this.savingsService.getAll('Active').pipe(takeUntil(this.destroy$)).subscribe({
      next: goals => {
        if (!Array.isArray(goals)) return;
        const now = new Date();
        goals.forEach(g => {
          if (!g.targetDate) return;
          const target = new Date(g.targetDate);
          const daysLeft = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft >= 0 && daysLeft <= 5) {
            this.toastService.show(
              'warning',
              'Savings Deadline Near',
              `"${g.name}" goal deadline is in ${daysLeft === 0 ? 'today' : daysLeft + ' day' + (daysLeft !== 1 ? 's' : '')}.`,
              'clock'
            );
          }
        });
      },
      error: () => {}
    });
  }

  trackByPath(_: number, item: { path: string }): string { return item.path; }

  /** Map shell icon key to Lucide kebab-case name for app-icon. */
  getLucideName(icon: string): string {
    const map: Record<string, string> = {
      'grid': 'layout-grid', 'swap': 'refresh-cw', 'bar-chart': 'bar-chart-2',
      'wallet': 'wallet', 'target': 'target', 'piggy': 'piggy-bank',
      'trending-up': 'trending-up', 'credit-card': 'credit-card',
      'tag': 'tag', 'bell': 'bell', 'book': 'book', 'settings': 'settings',
      'more': 'more-horizontal'
    };
    return map[icon] ?? 'circle';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.sidebarOpen && !target.closest('.sidebar') && !target.closest('.hamburger-btn')) {
      this.sidebarOpen = false;
    }
  }
}
