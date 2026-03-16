import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/api.services';
import { AiService } from '../../core/services/ai.service';
import { updateFaviconForTheme } from '../../core/utils/favicon';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  loading?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit, OnDestroy, AfterViewChecked {
  private destroy$ = new Subject<void>();

  @ViewChild('chatBody') chatBody!: ElementRef;

  sidebarOpen      = false;
  sidebarCollapsed = false;
  moreMenuOpen     = false;
  currentRoute     = '';
  unreadCount      = 0;
  isDark           = true;
  tooltipLabel     = '';
  tooltipVisible   = false;
  tooltipX         = 0;
  tooltipY         = 0;

  // ── AI Chat ──────────────────────────────────────────────
  chatOpen      = false;
  chatInput     = '';
  chatMessages: ChatMessage[] = [];
  chatSending   = false;
  private shouldScrollChat = false;

  navItems = [
    { path: '/',              label: 'Home',          icon: 'home',         group: 'overview' },
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

  get logoUrl(): string {
    return this.isDark ? 'logo/logoD.png' : 'logo/logoL.png';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private notifService: NotificationService,
    private aiService: AiService
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollChat) {
      this.scrollChatToBottom();
      this.shouldScrollChat = false;
    }
  }

  isActive(path: string): boolean {
    if (path === '/') return this.currentRoute === '/' || this.currentRoute === '';
    return this.currentRoute.startsWith(path);
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  toggleSidebarCollapse(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  showTooltip(label: string, event: MouseEvent): void {
    if (!this.sidebarCollapsed) return;
    this.tooltipLabel   = label;
    this.tooltipVisible = true;
    const el   = event.target as HTMLElement;
    const rect = el.closest?.('.nav-item')?.getBoundingClientRect?.() ?? el.getBoundingClientRect();
    this.tooltipX = rect.right + 8;
    this.tooltipY = rect.top + rect.height / 2;
  }

  hideTooltip(): void { this.tooltipVisible = false; }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
  }

  logout(): void { this.authService.logout(); }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    updateFaviconForTheme();
  }

  private loadUnreadCount(): void {
    this.notifService.getUnreadCount().pipe(takeUntil(this.destroy$)).subscribe({
      next: res => this.unreadCount = res.count,
      error: () => {}
    });
  }

  // ════════════════════════════════════════════════════════
  // AI CHAT METHODS
  // ════════════════════════════════════════════════════════
  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen && this.chatMessages.length === 0) {
      // Show welcome message on first open
      this.chatMessages.push({
        role: 'ai',
        text: 'Hi! I\'m FinTrack AI. Ask me anything about your finances — spending, budgets, savings, or tips to improve your financial health.'
      });
    }
    if (this.chatOpen) {
      this.shouldScrollChat = true;
    }
  }

  closeChat(): void { this.chatOpen = false; }

  sendMessage(): void {
    const text = this.chatInput.trim();
    if (!text || this.chatSending) return;

    // Add user message
    this.chatMessages.push({ role: 'user', text });
    this.chatInput    = '';
    this.chatSending  = true;
    this.shouldScrollChat = true;

    // Add loading placeholder
    const loadingMsg: ChatMessage = { role: 'ai', text: '', loading: true };
    this.chatMessages.push(loadingMsg);
    this.shouldScrollChat = true;

    // Build history (exclude loading msg and welcome msg for history)
    const history = this.chatMessages
      .filter(m => !m.loading && m.text)
      .slice(0, -1) // exclude the user msg we just added
      .slice(-6)    // last 6 messages only to save tokens
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));

    this.aiService.chat(text, history).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        // Replace loading msg with real reply
        const idx = this.chatMessages.indexOf(loadingMsg);
        if (idx !== -1) {
          this.chatMessages[idx] = { role: 'ai', text: res.reply };
        }
        this.chatSending      = false;
        this.shouldScrollChat = true;
      },
      error: () => {
        const idx = this.chatMessages.indexOf(loadingMsg);
        if (idx !== -1) {
          this.chatMessages[idx] = {
            role: 'ai',
            text: 'Sorry, I couldn\'t connect right now. Please try again in a moment.'
          };
        }
        this.chatSending      = false;
        this.shouldScrollChat = true;
      }
    });
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.chatMessages = [];
    this.toggleChat(); // re-open with welcome message
  }

  private scrollChatToBottom(): void {
    try {
      if (this.chatBody?.nativeElement) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    } catch {}
  }

  // ── Helpers ──────────────────────────────────────────────
  trackByPath(_: number, item: { path: string }): string { return item.path; }

  getLucideName(icon: string): string {
    const map: Record<string, string> = {
      'home': 'home', 'grid': 'layout-grid', 'swap': 'refresh-cw', 'bar-chart': 'bar-chart-2',
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