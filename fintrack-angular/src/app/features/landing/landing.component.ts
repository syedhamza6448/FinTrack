import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface Feature {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
  suffix?: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: false
})
export class LandingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoggedIn   = false;
  currentUser: any = null;
  scrolled     = false;
  menuOpen     = false;
  profileOpen  = false;
  unreadCount  = 3; // Mocked — wire to NotificationService if needed

  features: Feature[] = [
    { icon: '◈', title: 'Smart Budgeting',      desc: 'Set monthly budgets per category and get real-time alerts before you overspend.',          color: 'accent'  },
    { icon: '◎', title: 'Transaction Tracking',  desc: 'Every naira accounted for. Filter, search, and categorise transactions effortlessly.',      color: 'positive'},
    { icon: '⬡', title: 'Savings Goals',         desc: 'Define targets, track milestones, and watch your progress bars inch toward freedom.',        color: 'info'    },
    { icon: '◇', title: 'Investment Insights',   desc: 'Portfolio breakdown, asset allocation, and returns — all in one clean dashboard.',           color: 'purple'  },
    { icon: '◉', title: 'Debt Management',       desc: 'Know exactly what you owe, to whom, and how to eliminate it fastest.',                       color: 'warning' },
    { icon: '▣', title: 'Reports & Analytics',   desc: 'Beautiful charts and trend analysis so you always know where you stand financially.',        color: 'negative'},
  ];

  stats: Stat[] = [
    { value: '14',   label: 'Powerful Pages',    suffix: '' },
    { value: '100',  label: 'Free to Use',        suffix: '%' },
    { value: '360',  label: 'Financial View',     suffix: '°' },
    { value: '24/7', label: 'Always Available',   suffix: '' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.isLoggedIn  = !!user;
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 48;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const t = e.target as HTMLElement;
    if (!t.closest('.profile-menu-wrap')) this.profileOpen = false;
    if (!t.closest('.mobile-menu-wrap') && !t.closest('.hamburger')) this.menuOpen = false;
  }

  goToDashboard(): void { this.router.navigate(['/dashboard']); }
  goToLogin():     void { this.router.navigate(['/auth/login']); }
  goToSignup():    void { this.router.navigate(['/auth/register']); }
  goToProfile():   void { this.router.navigate(['/settings']); this.profileOpen = false; }
  goToNotifications(): void { this.router.navigate(['/notifications']); }

  logout(): void {
    this.authService.logout();
    this.profileOpen = false;
  }

  toggleProfile(): void { this.profileOpen = !this.profileOpen; }
  toggleMenu():    void { this.menuOpen    = !this.menuOpen; }

  get userInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}