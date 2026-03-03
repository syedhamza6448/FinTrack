import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
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

  loading = true;
  activeTab = 'monthly';
  selectedYear = new Date().getFullYear();
  selectedMonth = this.currentMonthValue();
  selectedPeriod = 'Monthly';

  monthlyTrend: any[] = [];
  topExpenseCategories: any[] = [];
  topIncomeCategories: any[] = [];

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  get yearOptions() { return this.years.map(y => ({ value: y, label: String(y) })); }

  periodOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Half-Yearly', label: 'Half-Yearly' },
    { value: 'Yearly', label: 'Yearly' }
  ];

  // Chart.js: monthly bar chart
  barChartData: { labels: string[]; datasets: { label: string; data: number[]; backgroundColor: string; borderColor?: string }[] } = {
    labels: [],
    datasets: [
      { label: 'Income', data: [], backgroundColor: 'rgba(76, 175, 80, 0.8)', borderColor: 'rgb(76, 175, 80)' },
      { label: 'Expenses', data: [], backgroundColor: 'rgba(244, 67, 54, 0.8)', borderColor: 'rgb(244, 67, 54)' }
    ]
  };
  barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: true, color: 'rgba(128,128,128,0.15)' } },
      y: {
        grid: { display: true, color: 'rgba(128,128,128,0.15)' },
        ticks: { callback: (v: number) => (v >= 1e6 ? (v / 1e6) + 'M' : v >= 1e3 ? (v / 1e3) + 'k' : v) }
      }
    },
    plugins: { legend: { position: 'top' } }
  };

  // Chart.js: expense pie chart
  pieChartData: { labels: string[]; datasets: { data: number[]; backgroundColor: string[] }[] } = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };

  get currency() { return this.authService.userCurrency; }

  get monthlyIncome(): number {
    const current = this.getMonthlyTrendEntry();
    return current?.income ?? 0;
  }
  get monthlyExpense(): number {
    const current = this.getMonthlyTrendEntry();
    return current?.expense ?? 0;
  }

  /** Resolve trend entry for selectedMonth (YYYY-MM); API may return month as number (1–12) or string. */
  private getMonthlyTrendEntry(): any {
    const [y, mo] = this.selectedMonth.split('-');
    const monthNum = parseInt(mo, 10);
    return this.monthlyTrend.find((m: any) =>
      typeof m.month === 'number' ? m.month === monthNum : String(m.month) === this.selectedMonth
    );
  }
  get monthlyNet(): number { return this.monthlyIncome - this.monthlyExpense; }
  get savingsRate(): number { return this.monthlyIncome > 0 ? (this.monthlyNet / this.monthlyIncome) * 100 : 0; }

  get maxTrendValue(): number {
    if (!this.monthlyTrend.length) return 1;
    return Math.max(...this.monthlyTrend.map(m => Math.max(m.income ?? 0, m.expense ?? 0)), 1);
  }

  constructor(
    private reportsService: ReportsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void { this.loadReport(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadReport(): void {
    this.loading = true;
    forkJoin({
      monthly: this.reportsService.getMonthly(this.selectedYear),
      expenseCategories: this.reportsService.getByCategory(this.selectedMonth, 'Expense'),
      incomeCategories: this.reportsService.getByCategory(this.selectedMonth, 'Income')
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.monthlyTrend = res.monthly ?? [];
        this.topExpenseCategories = res.expenseCategories ?? [];
        this.topIncomeCategories = res.incomeCategories ?? [];
        this.updateBarChartData();
        this.updatePieChartData();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  onFilterChange(): void { this.loadReport(); }
  setTab(tab: string): void { this.activeTab = tab; }

  private updateBarChartData(): void {
    if (!this.monthlyTrend || this.monthlyTrend.length === 0) {
      this.barChartData.labels = [];
      this.barChartData.datasets[0].data = [];
      this.barChartData.datasets[1].data = [];
      return;
    }

    if (this.selectedPeriod === 'Monthly') {
      this.barChartData.labels = this.monthlyTrend.map((m: any) => this.getMonthLabel(m));
      this.barChartData.datasets[0].data = this.monthlyTrend.map((m: any) => m.income ?? 0);
      this.barChartData.datasets[1].data = this.monthlyTrend.map((m: any) => m.expense ?? 0);
    } else if (this.selectedPeriod === 'Quarterly') {
      const qData = [
        { label: 'Q1', income: 0, expense: 0 },
        { label: 'Q2', income: 0, expense: 0 },
        { label: 'Q3', income: 0, expense: 0 },
        { label: 'Q4', income: 0, expense: 0 }
      ];
      this.monthlyTrend.forEach((m: any) => {
        const monthNum = typeof m.month === 'number' ? m.month : parseInt(String(m.month).split('-')[1] || '1', 10);
        const qIndex = Math.floor((monthNum - 1) / 3);
        if (qIndex >= 0 && qIndex < 4) {
          qData[qIndex].income += (m.income ?? 0);
          qData[qIndex].expense += (m.expense ?? 0);
        }
      });
      this.barChartData.labels = qData.map(q => q.label);
      this.barChartData.datasets[0].data = qData.map(q => q.income);
      this.barChartData.datasets[1].data = qData.map(q => q.expense);
    } else if (this.selectedPeriod === 'Half-Yearly') {
      const hData = [
        { label: 'H1', income: 0, expense: 0 },
        { label: 'H2', income: 0, expense: 0 }
      ];
      this.monthlyTrend.forEach((m: any) => {
        const monthNum = typeof m.month === 'number' ? m.month : parseInt(String(m.month).split('-')[1] || '1', 10);
        const hIndex = Math.floor((monthNum - 1) / 6);
        if (hIndex >= 0 && hIndex < 2) {
          hData[hIndex].income += (m.income ?? 0);
          hData[hIndex].expense += (m.expense ?? 0);
        }
      });
      this.barChartData.labels = hData.map(h => h.label);
      this.barChartData.datasets[0].data = hData.map(h => h.income);
      this.barChartData.datasets[1].data = hData.map(h => h.expense);
    } else if (this.selectedPeriod === 'Yearly') {
      const yData = { label: String(this.selectedYear), income: 0, expense: 0 };
      this.monthlyTrend.forEach((m: any) => {
        yData.income += (m.income ?? 0);
        yData.expense += (m.expense ?? 0);
      });
      this.barChartData.labels = [yData.label];
      this.barChartData.datasets[0].data = [yData.income];
      this.barChartData.datasets[1].data = [yData.expense];
    }
  }

  private updatePieChartData(): void {
    const colors = ['#f44336', '#ff9800', '#2196f3', '#4caf50', '#9c27b0'];
    this.pieChartData = {
      labels: this.topExpenseCategories.map((c: any) => c.categoryName ?? ''),
      datasets: [{
        data: this.topExpenseCategories.map((c: any) => c.total ?? 0),
        backgroundColor: this.topExpenseCategories.map((_: any, i: number) => colors[i % colors.length])
      }]
    };
  }

  getBarHeight(value: number): string {
    return `${Math.round((value / this.maxTrendValue) * 100)}%`;
  }

  getCategoryBarWidth(pct: number): string { return `${Math.min(pct, 100)}%`; }

  getCategoryColor(i: number): string {
    const colors = ['var(--negative)', 'var(--accent)', 'var(--info)', 'var(--positive)', 'var(--purple)'];
    return colors[i % colors.length];
  }

  getMonthLabel(m: any): string {
    if (m?.month == null) return '';
    if (typeof m.month === 'number') {
      return new Date(this.selectedYear, m.month - 1).toLocaleString('default', { month: 'short' });
    }
    const parts = String(m.month).split('-');
    if (parts.length >= 2) {
      return new Date(+parts[0], +parts[1] - 1).toLocaleString('default', { month: 'short' });
    }
    return m.label ?? '';
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