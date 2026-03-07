import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ReportsService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { NetWorthReport } from '../../core/models/models';

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
  reportScope: 'Monthly' | 'Quarterly' | 'Annual' = 'Monthly';

  monthlyTrend: any[] = [];
  topExpenseCategories: any[] = [];
  topIncomeCategories: any[] = [];
  netWorth: NetWorthReport | null = null;

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  get yearOptions() { return this.years.map(y => ({ value: y, label: String(y) })); }

  reportScopeOptions = [
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Annual', label: 'Annual' }
  ];

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

  downloadPDF(): void {
    const monthLabel = this.summaryScopeLabel;
    const docTitle = `FinTrack Report - ${monthLabel}`;

    const html = `
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
            h1 { color: #333; border-bottom: 3px solid #4caf50; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; border-left: 4px solid #2196f3; padding-left: 10px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .summary-card { background: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #666; }
            .summary-label { font-size: 12px; color: #999; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .summary-value { font-size: 20px; font-weight: bold; color: #333; }
            .summary-card.income { border-left-color: #4caf50; }
            .summary-card.expense { border-left-color: #f44336; }
            .summary-card.savings { border-left-color: #2196f3; }
            .category-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .category-table th { background: #f5f5f5; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
            .category-table td { padding: 10px 12px; border-bottom: 1px solid #eee; }
            .category-name { font-weight: 500; color: #333; }
            .category-amount { color: #4caf50; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
            .chart-placeholder { background: #f9f9f9; padding: 20px; border-radius: 6px; text-align: center; color: #999; margin: 20px 0; }
            .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📊 FinTrack Financial Report</h1>
            <p><strong>Period:</strong> ${monthLabel}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>

            <h2>Summary Report</h2>
            <div class="summary">
              <div class="summary-card income">
                <div class="summary-label">Total Income</div>
                <div class="summary-value">${this.currency}${this.formatCurrency(this.summaryIncome)}</div>
              </div>
              <div class="summary-card expense">
                <div class="summary-label">Total Expenses</div>
                <div class="summary-value">${this.currency}${this.formatCurrency(this.summaryExpense)}</div>
              </div>
              <div class="summary-card savings">
                <div class="summary-label">Net Savings</div>
                <div class="summary-value">${this.currency}${this.formatCurrency(this.summaryNet)}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Savings Rate</div>
                <div class="summary-value">${this.savingsRate.toFixed(1)}%</div>
              </div>
            </div>

            <h2>Monthly Trend</h2>
            <table class="category-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Savings</th>
                </tr>
              </thead>
              <tbody>
                ${this.monthlyTrend.map((m: any) => `
                  <tr>
                    <td>${this.getMonthLabel(m)}</td>
                    <td class="category-amount">${this.currency}${this.formatCurrency(m.income ?? 0)}</td>
                    <td class="category-amount" style="color: #f44336;">${this.currency}${this.formatCurrency(m.expense ?? 0)}</td>
                    <td class="category-amount">${this.currency}${this.formatCurrency((m.income ?? 0) - (m.expense ?? 0))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h2>Expense Breakdown by Category</h2>
            <table class="category-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${this.topExpenseCategories.map((c: any, i: number) => {
                  const total = this.summaryExpense;
                  const pct = total > 0 ? ((c.total ?? 0) / total * 100).toFixed(1) : '0.0';
                  return `
                    <tr>
                      <td class="category-name">${c.categoryName}</td>
                      <td class="category-amount">${this.currency}${this.formatCurrency(c.total ?? 0)}</td>
                      <td>${pct}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <h2>Income Sources</h2>
            <table class="category-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${this.topIncomeCategories.map((c: any) => {
                  const total = this.summaryIncome;
                  const pct = total > 0 ? ((c.total ?? 0) / total * 100).toFixed(1) : '0.0';
                  return `
                    <tr>
                      <td class="category-name">${c.categoryName}</td>
                      <td class="category-amount">${this.currency}${this.formatCurrency(c.total ?? 0)}</td>
                      <td>${pct}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>This report was generated by FinTrack Financial Manager. For more information, visit your dashboard.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    this.generatePDFFromHTML(html, `FinTrack-Report-${this.selectedMonth}.pdf`);
  }

  private generatePDFFromHTML(html: string, filename: string): void {
    const printWindow = window.open('', '', 'height=1000,width=1200');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  loadReport(): void {
    this.loading = true;
    forkJoin({
      monthly: this.reportsService.getMonthly(this.selectedYear),
      expenseCategories: this.reportsService.getByCategory(this.selectedMonth, 'Expense'),
      incomeCategories: this.reportsService.getByCategory(this.selectedMonth, 'Income'),
      netWorth: this.reportsService.getNetWorth()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.monthlyTrend = res.monthly ?? [];
        this.topExpenseCategories = res.expenseCategories ?? [];
        this.topIncomeCategories = res.incomeCategories ?? [];
        this.netWorth = res.netWorth ?? null;
        this.updateBarChartData();
        this.updatePieChartData();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  /** Summary totals for the selected report scope (monthly / quarter / year). */
  get summaryIncome(): number {
    return this.aggregateTrend('income');
  }
  get summaryExpense(): number {
    return this.aggregateTrend('expense');
  }
  get summarySavings(): number {
    const trend = this.getTrendForScope();
    return trend.reduce((s, m) => s + (m.savings != null ? m.savings : (m.income ?? 0) - (m.expense ?? 0)), 0);
  }
  get summaryNet(): number {
    return this.summaryIncome - this.summaryExpense;
  }
  get summaryScopeLabel(): string {
    if (this.reportScope === 'Annual') return `Year ${this.selectedYear}`;
    if (this.reportScope === 'Quarterly') {
      const [y, m] = this.selectedMonth.split('-').map(Number);
      const q = Math.floor((m - 1) / 3) + 1;
      return `Q${q} ${y}`;
    }
    const [y, m] = this.selectedMonth.split('-').map(Number);
    return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  private getTrendForScope(): any[] {
    const [, moStr] = this.selectedMonth.split('-');
    const mo = parseInt(moStr, 10);
    if (this.reportScope === 'Monthly') {
      const entry = this.monthlyTrend.find((m: any) =>
        typeof m.month === 'number' ? m.month === mo : String(m.month) === this.selectedMonth
      );
      return entry ? [entry] : [];
    }
    if (this.reportScope === 'Quarterly') {
      const startMonth = (Math.floor((mo - 1) / 3) * 3) + 1;
      return this.monthlyTrend.filter((m: any) => {
        const num = typeof m.month === 'number' ? m.month : parseInt(String(m.month).split('-')[1], 10) || 0;
        return num >= startMonth && num < startMonth + 3;
      });
    }
    return this.monthlyTrend;
  }

  private aggregateTrend(field: 'income' | 'expense'): number {
    return this.getTrendForScope().reduce((s, m) => s + (m[field] ?? 0), 0);
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
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n ?? 0);
  }

  private currentMonthValue(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  trackByIndex(i: number): number { return i; }
}
