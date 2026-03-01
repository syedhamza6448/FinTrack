import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { EducationService } from '../../core/services/api.services';
import { EducationArticle, EducationModule, EducationGuide } from '../../core/models/models';

@Component({
  selector: 'app-education',
  standalone: false,
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss']
})
export class EducationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ── Tab state ──────────────────────────────────────────────
  activeTab  = 'tips';
  activeCalc = 'loan';

  // ── Loading states ─────────────────────────────────────────
  loadingArticles = true;
  loadingModules  = true;
  loadingGuides   = true;
  loadingArticle  = false;
  loadingModule   = false;

  // ── Data ───────────────────────────────────────────────────
  articles:   EducationArticle[] = [];
  modules:    EducationModule[]  = [];
  guides:     EducationGuide[]   = [];
  categories: string[]           = ['All'];
  filterCategory = '';

  activeArticle: EducationArticle | null = null;
  activeModule:  EducationModule  | null = null;

  // ── Calculator Forms ───────────────────────────────────────
  loanForm!:     FormGroup;
  compoundForm!: FormGroup;
  savingsForm!:  FormGroup;
  debtForm!:     FormGroup;

  // ── Calculator Results ─────────────────────────────────────
  loanResult:     any = null;
  compoundResult: any = null;
  savingsResult:  any = null;
  debtResult:     any = null;

  // ── Filtered articles ──────────────────────────────────────
  get filteredArticles(): EducationArticle[] {
    if (!this.filterCategory || this.filterCategory === 'All') return this.articles;
    return this.articles.filter(a => a.category === this.filterCategory);
  }

  constructor(
    private fb: FormBuilder,
    private educationService: EducationService
  ) {}

  ngOnInit(): void {
    this.buildCalculatorForms();
    this.loadArticles();
    this.loadModules();
    this.loadGuides();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Data Loading ───────────────────────────────────────────
  loadArticles(): void {
    this.loadingArticles = true;
    forkJoin({
      articles:   this.educationService.getArticles(),
      categories: this.educationService.getArticleCategories()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.articles   = res.articles;
        this.categories = ['All', ...res.categories];
        this.loadingArticles = false;
      },
      error: () => { this.loadingArticles = false; }
    });
  }

  loadModules(): void {
    this.loadingModules = true;
    this.educationService.getModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: modules => { this.modules = modules; this.loadingModules = false; },
        error: ()     => { this.loadingModules = false; }
      });
  }

  loadGuides(): void {
    this.loadingGuides = true;
    this.educationService.getGuides()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: guides => { this.guides = guides; this.loadingGuides = false; },
        error: ()    => { this.loadingGuides = false; }
      });
  }

  openArticle(id: number): void {
    this.loadingArticle = true;
    this.educationService.getArticleById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: article => { this.activeArticle = article; this.loadingArticle = false; },
        error: ()     => { this.loadingArticle = false; }
      });
  }

  closeArticle(): void { this.activeArticle = null; }

  openModule(id: number): void {
    this.loadingModule = true;
    this.educationService.getModuleById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: mod  => { this.activeModule = mod; this.loadingModule = false; },
        error: ()  => { this.loadingModule = false; }
      });
  }

  closeModule(): void { this.activeModule = null; }

  // ── Tab / Calc navigation ──────────────────────────────────
  setTab(tab: string): void {
    this.activeTab    = tab;
    this.activeArticle = null;
    this.activeModule  = null;
  }

  setCalc(calc: string): void { this.activeCalc = calc; }

  // ── Calculator Forms ───────────────────────────────────────
  private buildCalculatorForms(): void {
    this.loanForm = this.fb.group({
      principal: [500000, [Validators.required, Validators.min(1)]],
      rate:      [18,     [Validators.required, Validators.min(0.1)]],
      tenure:    [24,     [Validators.required, Validators.min(1)]]
    });
    this.compoundForm = this.fb.group({
      principal: [100000, [Validators.required, Validators.min(1)]],
      rate:      [12,     [Validators.required, Validators.min(0.1)]],
      years:     [10,     [Validators.required, Validators.min(1)]],
      frequency: [12]
    });
    this.savingsForm = this.fb.group({
      target:  [1000000, [Validators.required, Validators.min(1)]],
      monthly: [50000,   [Validators.required, Validators.min(1)]],
      rate:    [10,      [Validators.required, Validators.min(0)]]
    });
    this.debtForm = this.fb.group({
      balance: [500000, [Validators.required, Validators.min(1)]],
      rate:    [24,     [Validators.required, Validators.min(0.1)]],
      monthly: [30000,  [Validators.required, Validators.min(1)]]
    });

    // Auto-calculate with default values
    this.calcLoan();
    this.calcCompound();
    this.calcSavings();
    this.calcDebt();
  }

  // ── Calculators ────────────────────────────────────────────
  calcLoan(): void {
    if (this.loanForm?.invalid) return;
    const { principal, rate, tenure } = this.loanForm.value;
    const r   = rate / 100 / 12;
    const n   = tenure;
    const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const total    = emi * n;
    const interest = total - principal;
    this.loanResult = {
      emi:           Math.round(emi),
      totalPayment:  Math.round(total),
      totalInterest: Math.round(interest),
      interestPct:   Math.round((interest / principal) * 100),
      principalPct:  Math.round((principal / total) * 100)
    };
  }

  calcCompound(): void {
    if (this.compoundForm?.invalid) return;
    const { principal, rate, years, frequency } = this.compoundForm.value;
    const r      = rate / 100;
    const amount = principal * Math.pow(1 + r / frequency, frequency * years);
    this.compoundResult = {
      finalAmount: Math.round(amount),
      interest:    Math.round(amount - principal),
      multiplier:  (amount / principal).toFixed(2),
      yearlyData:  Array.from({ length: Math.min(years, 20) }, (_, i) => ({
        year:   i + 1,
        amount: Math.round(principal * Math.pow(1 + r / frequency, frequency * (i + 1)))
      }))
    };
  }

  calcSavings(): void {
    if (this.savingsForm?.invalid) return;
    const { target, monthly, rate } = this.savingsForm.value;
    const r = rate / 100 / 12;
    let balance = 0;
    let months  = 0;
    while (balance < target && months < 600) {
      balance = balance * (1 + r) + monthly;
      months++;
    }
    const contributed = monthly * months;
    this.savingsResult = {
      months,
      years:           Math.floor(months / 12),
      remainingMonths: months % 12,
      totalContributed: Math.round(contributed),
      totalInterest:    Math.round(balance - contributed),
      finalBalance:     Math.round(balance),
      achieved:         months < 600
    };
  }

  calcDebt(): void {
    if (this.debtForm?.invalid) return;
    const { balance, rate, monthly } = this.debtForm.value;
    const r = rate / 100 / 12;
    if (monthly <= balance * r) { this.debtResult = { impossible: true }; return; }
    let remaining = balance;
    let months    = 0;
    let totalInterest = 0;
    while (remaining > 0 && months < 600) {
      const interest  = remaining * r;
      totalInterest  += interest;
      remaining       = remaining + interest - monthly;
      if (remaining < 0) remaining = 0;
      months++;
    }
    this.debtResult = {
      months,
      years:           Math.floor(months / 12),
      remainingMonths: months % 12,
      totalInterest:   Math.round(totalInterest),
      totalPaid:       Math.round(monthly * months),
      impossible:      false
    };
  }

  // ── Helpers ────────────────────────────────────────────────
  getDifficultyClass(d: string): string {
    if (d === 'Beginner')     return 'beginner';
    if (d === 'Intermediate') return 'intermediate';
    return 'advanced';
  }

  get maxTrendValue(): number {
    if (!this.compoundResult?.yearlyData?.length) return 1;
    return this.compoundResult.finalAmount;
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n ?? 0);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatContent(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
  trackByIndex(i: number): number { return i; }
}