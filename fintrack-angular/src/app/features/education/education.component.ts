import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EducationArticle, EducationModule, EducationGuide } from '../../core/models/models';

@Component({
  selector: 'app-education',
  standalone: false,
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.scss']
})
export class EducationComponent implements OnInit, OnDestroy {
  // ── Tab state ──────────────────────────────────────────────
  activeTab = 'tips';
  activeCalc = 'loan';

  // ── Loading states ─────────────────────────────────────────
  loadingArticles = false;
  loadingModules = false;
  loadingGuides = false;
  loadingArticle = false;
  loadingModule = false;

  // ── Data ───────────────────────────────────────────────────
  articles: EducationArticle[] = [
    {
      id: 1,
      title: 'Mastering the 50/30/20 Rule',
      summary: 'A simple budgeting method to build financial stability.',
      content: 'The 50/30/20 rule is a straightforward way to manage your money:\n\n**50% for Needs:** Housing, groceries, utilities, and essential transportation.\n\n**30% for Wants:** Entertainment, dining out, and hobbies.\n\n**20% for Savings & Debt:** Building an emergency fund, investing, or paying down high-interest debt.\n\nStart by tracking your expenses for a month, then categorize them into these three buckets to see where you can adjust.',
      category: 'Budgeting',
      icon: '📊',
      readTime: 4,
      publishedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Understanding Compound Interest',
      summary: 'How your money can grow exponentially over time.',
      content: 'Compound interest is the interest on savings calculated on both the initial principal and the accumulated interest from previous periods.\n\n**Why it matters:** It allows your wealth to grow faster. The earlier you start investing, the more time your money has to compound.\n\n**Rule of 72:** Divide 72 by your annual interest rate to estimate how many years it will take to double your money.\n\nStart small, but start early!',
      category: 'Investing',
      icon: '📈',
      readTime: 6,
      publishedAt: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Emergency Funds 101',
      summary: 'Why you need one and how to build it efficiently.',
      content: 'An emergency fund is a stash of money set aside to cover the financial surprises life throws your way.\n\n**How much do you need?** Aim for 3 to 6 months of essential living expenses.\n\n**Where to keep it:** A high-yield savings account (HYSA) so it’s easily accessible but still earns some interest.\n\n**How to start:** Automate a small transfer every payday into your emergency fund account until you hit your goal.',
      category: 'Savings',
      icon: '🛡️',
      readTime: 5,
      publishedAt: new Date().toISOString()
    }
  ];

  modules: EducationModule[] = [
    {
      id: 101,
      title: 'Personal Finance Basics',
      description: 'Everything you need to know to get started with managing your money.',
      icon: '📘',
      lessons: 5,
      difficulty: 'Beginner',
      topics: ['Budgeting', 'Banking', 'Credit Scores']
    },
    {
      id: 102,
      title: 'Investing for Beginners',
      description: 'Learn the fundamentals of stocks, bonds, and building a portfolio.',
      icon: '📊',
      lessons: 8,
      difficulty: 'Intermediate',
      topics: ['Stocks & Bonds', 'ETFs & Mutual Funds', 'Risk Tolerance']
    },
    {
      id: 103,
      title: 'Debt Payoff Strategies',
      description: 'Actionable plans to eliminate high-interest debt efficiently.',
      icon: '🎯',
      lessons: 4,
      difficulty: 'Beginner',
      topics: ['Snowball Method', 'Avalanche Method', 'Consolidation']
    }
  ];

  guides: EducationGuide[] = [
    {
      id: 201,
      title: 'Buying Your First Home',
      goal: 'Save for a down payment, improve credit score, and get pre-approved.',
      icon: '🏠',
      steps: [
        'Determine your budget',
        'Save 20% for down payment',
        'Check and improve your credit score',
        'Get pre-approved for a mortgage'
      ],
      tip: 'Don\'t forget closing costs! Set aside an extra 2–5% of the purchase price.'
    },
    {
      id: 202,
      title: 'Planning for Retirement',
      goal: 'Understand accounts, set target age, and maximise contributions.',
      icon: '🌅',
      steps: [
        'Calculate your retirement number',
        'Open and fund a 401(k) or IRA',
        'Take advantage of employer matching',
        'Diversify your investments'
      ],
      tip: 'The earlier you start, the less you have to save monthly thanks to compound interest.'
    },
    {
      id: 203,
      title: 'Planning a Major Vacation',
      goal: 'Set a travel budget, start a sinking fund, and book in advance.',
      icon: '✈️',
      steps: [
        'Estimate total trip cost',
        'Set up a dedicated savings bucket',
        'Automate weekly transfers',
        'Book flights and hotels early'
      ],
      tip: 'Travel rewards credit cards can heavily subsidise your flights if used responsibly.'
    }
  ];

  categories: string[] = ['All', 'Budgeting', 'Investing', 'Savings'];
  filterCategory = '';

  activeArticle: EducationArticle | null = null;
  activeModule: EducationModule | null = null;

  get currency() { return '₦'; }

  // ── Calculator Forms ───────────────────────────────────────
  loanForm!: FormGroup;
  compoundForm!: FormGroup;
  savingsForm!: FormGroup;
  debtForm!: FormGroup;

  // ── Calculator Results ─────────────────────────────────────
  loanResult: any = null;
  compoundResult: any = null;
  savingsResult: any = null;
  debtResult: any = null;

  frequencyOptions = [
    { value: 1, label: 'Annually' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' },
    { value: 365, label: 'Daily' }
  ];

  // ── Filtered articles ──────────────────────────────────────
  get filteredArticles(): EducationArticle[] {
    if (!this.filterCategory || this.filterCategory === 'All') return this.articles;
    return this.articles.filter(a => a.category === this.filterCategory);
  }

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.buildCalculatorForms();
  }

  ngOnDestroy(): void {
    // No subscriptions to clean up — required only to satisfy the interface.
  }

  openArticle(id: number): void {
    this.loadingArticle = true;
    const found = this.articles.find(a => a.id === id) || null;
    this.activeArticle = found;
    this.loadingArticle = false;
  }

  closeArticle(): void { this.activeArticle = null; }

  openModule(id: number): void {
    this.loadingModule = true;
    const found = this.modules.find(m => m.id === id) || null;
    this.activeModule = found;
    this.loadingModule = false;
  }

  closeModule(): void { this.activeModule = null; }

  // ── Tab / Calc navigation ──────────────────────────────────
  setTab(tab: string): void {
    this.activeTab = tab;
    this.activeArticle = null;
    this.activeModule = null;
  }

  setCalc(calc: string): void { this.activeCalc = calc; }

  // ── Calculator Forms ───────────────────────────────────────
  private buildCalculatorForms(): void {
    this.loanForm = this.fb.group({
      principal: [500000, [Validators.required, Validators.min(1)]],
      rate: [18, [Validators.required, Validators.min(0.1)]],
      tenure: [24, [Validators.required, Validators.min(1)]]
    });
    this.compoundForm = this.fb.group({
      principal: [100000, [Validators.required, Validators.min(1)]],
      rate: [12, [Validators.required, Validators.min(0.1)]],
      years: [10, [Validators.required, Validators.min(1)]],
      frequency: [12]
    });
    this.savingsForm = this.fb.group({
      target: [1000000, [Validators.required, Validators.min(1)]],
      monthly: [50000, [Validators.required, Validators.min(1)]],
      rate: [10, [Validators.required, Validators.min(0)]]
    });
    this.debtForm = this.fb.group({
      balance: [500000, [Validators.required, Validators.min(1)]],
      rate: [24, [Validators.required, Validators.min(0.1)]],
      monthly: [30000, [Validators.required, Validators.min(1)]]
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
    const r = rate / 100 / 12;
    const n = tenure;
    const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - principal;
    this.loanResult = {
      emi: Math.round(emi),
      totalPayment: Math.round(total),
      totalInterest: Math.round(interest),
      interestPct: Math.round((interest / principal) * 100),
      principalPct: Math.round((principal / total) * 100)
    };
  }

  calcCompound(): void {
    if (this.compoundForm?.invalid) return;
    const { principal, rate, years, frequency } = this.compoundForm.value;
    const r = rate / 100;
    const amount = principal * Math.pow(1 + r / frequency, frequency * years);
    this.compoundResult = {
      finalAmount: Math.round(amount),
      interest: Math.round(amount - principal),
      multiplier: (amount / principal).toFixed(2),
      yearlyData: Array.from({ length: Math.min(years, 20) }, (_, i) => ({
        year: i + 1,
        amount: Math.round(principal * Math.pow(1 + r / frequency, frequency * (i + 1)))
      }))
    };
  }

  calcSavings(): void {
    if (this.savingsForm?.invalid) return;
    const { target, monthly, rate } = this.savingsForm.value;
    const r = rate / 100 / 12;
    let balance = 0;
    let months = 0;
    while (balance < target && months < 600) {
      balance = balance * (1 + r) + monthly;
      months++;
    }
    const contributed = monthly * months;
    this.savingsResult = {
      months,
      years: Math.floor(months / 12),
      remainingMonths: months % 12,
      totalContributed: Math.round(contributed),
      totalInterest: Math.round(balance - contributed),
      finalBalance: Math.round(balance),
      achieved: months < 600
    };
  }

  calcDebt(): void {
    if (this.debtForm?.invalid) return;
    const { balance, rate, monthly } = this.debtForm.value;
    const r = rate / 100 / 12;
    if (monthly <= balance * r) { this.debtResult = { impossible: true }; return; }
    let remaining = balance;
    let months = 0;
    let totalInterest = 0;
    while (remaining > 0 && months < 600) {
      const interest = remaining * r;
      totalInterest += interest;
      remaining = remaining + interest - monthly;
      if (remaining < 0) remaining = 0;
      months++;
    }
    this.debtResult = {
      months,
      years: Math.floor(months / 12),
      remainingMonths: months % 12,
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(monthly * months),
      impossible: false
    };
  }

  // ── Helpers ────────────────────────────────────────────────
  getDifficultyClass(d: string): string {
    if (d === 'Beginner') return 'beginner';
    if (d === 'Intermediate') return 'intermediate';
    return 'advanced';
  }

  get maxTrendValue(): number {
    if (!this.compoundResult?.yearlyData?.length) return 1;
    return this.compoundResult.finalAmount;
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'decimal',
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