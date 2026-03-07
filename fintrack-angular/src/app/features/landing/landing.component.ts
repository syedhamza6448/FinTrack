import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
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

interface HowStep {
  num: string;
  icon: string;
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

interface TickerItem {
  label: string;
  val: string;
  positive: boolean;
}

interface FooterLink {
  label: string;
  route: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone: false
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  isLoggedIn   = false;
  currentUser: any = null;
  scrolled     = false;
  menuOpen     = false;
  profileOpen  = false;
  heroVisible  = false;
  unreadCount  = 3;

  activeFeature = 0;

  tickerItems: TickerItem[] = [
    { label: 'Net Worth',     val: '$24,850,000',  positive: true  },
    { label: 'Savings Rate',  val: '+18.4%',        positive: true  },
    { label: 'Budget Used',   val: '54%',           positive: true  },
    { label: 'Investments',   val: '+12.4%',        positive: true  },
    { label: 'Debt Cleared',  val: '$120,000',      positive: true  },
    { label: 'Monthly Income',val: '$1,840,000',   positive: true  },
    { label: 'Goal Progress', val: 'Emergency Fund ✓', positive: true },
    { label: 'Expenses',      val: '-$680,000',     positive: false },
  ];

  features: Feature[] = [
    { icon: 'target',      title: 'Smart Budgeting',      desc: 'Set monthly budgets per category and get real-time alerts before you overspend. Visual progress bars keep you honest.',          color: 'accent'   },
    { icon: 'wallet',      title: 'Transaction Tracking',  desc: 'Every penny accounted for. Filter, search, and categorise income and expenses effortlessly across every account.',             color: 'positive' },
    { icon: 'piggy-bank',  title: 'Savings Goals',         desc: 'Define targets, set deadlines, track milestones, and watch your progress bars inch toward financial freedom.',                 color: 'info'     },
    { icon: 'trending-up', title: 'Investment Insights',   desc: 'Portfolio breakdown, asset allocation, and return analysis — all consolidated into one clean, live dashboard.',                color: 'purple'   },
    { icon: 'credit-card', title: 'Debt Management',       desc: 'Know exactly what you owe, to whom, and at what rate. Visualise payoff timelines and eliminate debt strategically.',          color: 'warning'  },
    { icon: 'pie-chart',   title: 'Reports & Analytics',   desc: 'Beautiful monthly, quarterly, and annual reports. Export as PDF or drill into interactive charts by category or period.',     color: 'negative' },
    { icon: 'bell',        title: 'Smart Notifications',   desc: 'Budget overrun alerts, goal milestone pings, and scheduled reminders delivered in-app so nothing slips through the cracks.',  color: 'accent'   },
    { icon: 'book',        title: 'Financial Education',   desc: 'Curated articles, glossaries, and bite-sized financial lessons built right into the dashboard — learn as you track.',          color: 'positive' },
  ];

  stats: Stat[] = [
    { value: '14',   suffix: '',  label: 'Purpose-built pages'  },
    { value: '100',  suffix: '%', label: 'Free forever'         },
    { value: '360',  suffix: '°', label: 'Financial visibility' },
    { value: '24/7', suffix: '',  label: 'Always on'            },
  ];

  howSteps: HowStep[] = [
    { num: '01', icon: 'user-plus',     title: 'Create your account',    desc: 'Sign up in under 60 seconds. 10 default categories seeded instantly — no configuration needed.'     },
    { num: '02', icon: 'database',      title: 'Connect your finances',   desc: 'Add bank accounts, log transactions, set budgets, and define savings goals all in one flow.'        },
    { num: '03', icon: 'bar-chart-2',   title: 'Watch clarity emerge',    desc: 'Live charts, alerts, and AI-powered insights surface the patterns you\'ve never noticed before.'     },
  ];

  testimonials: Testimonial[] = [
    { name: 'Adaeze Okonkwo',  role: 'Software Engineer, Lagos',    avatar: 'AO', quote: 'FinTrack finally made me understand where my salary was going. The budget alerts alone changed my habits completely.',          rating: 5 },
    { name: 'Babatunde Karimu',role: 'Entrepreneur, Abuja',         avatar: 'BK', quote: 'The investment tracking dashboard is genuinely impressive. I can see my entire portfolio in one glance.',                        rating: 5 },
    { name: 'Chioma Ikenna',   role: 'Accountant, Port Harcourt',   avatar: 'CI', quote: 'As an accountant I\'m picky about financial tools. FinTrack\'s reports are clean, accurate and export beautifully.',            rating: 5 },
    { name: 'Damilola Fasina', role: 'Medical Doctor, Ibadan',      avatar: 'DF', quote: 'The savings goals feature with progress tracking is addictive. I hit my Emergency Fund target in 4 months.',                    rating: 5 },
  ];

  footerProduct: FooterLink[] = [
    { label: 'Dashboard',    route: '/dashboard'    },
    { label: 'Transactions', route: '/transactions' },
    { label: 'Reports',      route: '/reports'      },
    { label: 'Education',    route: '/education'    },
  ];
  footerTools: FooterLink[] = [
    { label: 'Budget',       route: '/budget'       },
    { label: 'Savings',      route: '/savings'      },
    { label: 'Investments',  route: '/investments'  },
    { label: 'Debt Tracker', route: '/debt'         },
  ];
  footerAccount: FooterLink[] = [
    { label: 'Login',        route: '/auth/login'     },
    { label: 'Register',     route: '/auth/register'  },
    { label: 'Settings',     route: '/settings'       },
    { label: 'Notifications',route: '/notifications'  },
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

  ngAfterViewInit(): void {
    setTimeout(() => { this.heroVisible = true; }, 80);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 48; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const t = e.target as HTMLElement;
    if (!t.closest('.profile-menu-wrap')) this.profileOpen = false;
    if (!t.closest('.mobile-menu-wrap') && !t.closest('.hamburger')) this.menuOpen = false;
  }

  goToDashboard():    void { this.router.navigate(['/dashboard']); }
  goToLogin():        void { this.router.navigate(['/auth/login']); }
  goToSignup():       void { this.router.navigate(['/auth/register']); }
  goToProfile():      void { this.router.navigate(['/settings']); this.profileOpen = false; }
  goToNotifications():void { this.router.navigate(['/notifications']); }

  logout(): void { this.authService.logout(); this.profileOpen = false; }
  toggleProfile(): void { this.profileOpen = !this.profileOpen; }
  toggleMenu():    void { this.menuOpen    = !this.menuOpen; }

  get userInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get logoUrl(): string {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    return theme === 'light' ? 'logo/logoL.png' : 'logo/logoD.png';
  }

  scrollToFeatures(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }

  setActiveFeature(i: number): void { this.activeFeature = i; }

  get starArray(): number[] { return [1,2,3,4,5]; }
}