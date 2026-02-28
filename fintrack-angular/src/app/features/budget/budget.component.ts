import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BudgetService, CategoryService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Budget, Category } from '../../core/models/models';

@Component({
  selector: 'app-budget',
  standalone: false,
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  budgets: Budget[]       = [];
  categories: Category[]  = [];
  overview: any           = null;
  loading                 = true;
  submitting              = false;
  showModal               = false;
  editingId: number | null = null;
  modalError              = '';
  deletingId: number | null = null;
  showDeleteConfirm       = false;
  selectedMonth           = this.currentMonthValue();

  budgetForm!: FormGroup;

  get currency()           { return this.authService.userCurrency; }
  get expenseCategories()  { return this.categories.filter(c => c.type === 'Expense'); }
  get modalTitle()         { return this.editingId ? 'Edit Budget' : 'Set Budget'; }

  get totalBudgeted() { return this.budgets.reduce((s, b) => s + b.amount, 0); }
  get totalSpent()    { return this.budgets.reduce((s, b) => s + b.spent, 0); }
  get overallPct()    { return this.totalBudgeted > 0 ? (this.totalSpent / this.totalBudgeted) * 100 : 0; }

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.budgetForm = this.fb.group({
      categoryId: [null, Validators.required],
      amount:     [null, [Validators.required, Validators.min(1)]],
      month:      [new Date().getMonth() + 1],
      year:       [new Date().getFullYear()]
    });
    this.loadCategories();
    this.loadBudgets();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadBudgets(): void {
    this.loading = true;
    this.budgetService.getAll(this.selectedMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: budgets => { this.budgets = budgets; this.loading = false; },
        error: ()     => { this.loading = false; }
      });
  }

  loadCategories(): void {
    this.categoryService.getAll('Expense')
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: cats => this.categories = cats, error: () => {} });
  }

  onMonthChange(): void { this.loadBudgets(); }

  openAdd(): void {
    this.editingId = null; this.modalError = '';
    this.budgetForm.reset({ categoryId: null, amount: null, month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    this.showModal = true;
  }

  openEdit(b: Budget): void {
    this.editingId = b.id; this.modalError = '';
    this.budgetForm.patchValue({ categoryId: b.category.id, amount: b.amount, month: b.month, year: b.year });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    if (this.budgetForm.invalid) { this.budgetForm.markAllAsTouched(); return; }
    this.submitting = true; this.modalError = '';

    const done = () => { this.submitting = false; this.showModal = false; this.loadBudgets(); };
    const fail = (err: any) => { this.submitting = false; this.modalError = err.error?.message ?? 'Failed to save budget.'; };

    if (this.editingId) {
      this.budgetService.update(this.editingId, this.budgetForm.value)
        .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
    } else {
      this.budgetService.create(this.budgetForm.value)
        .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
    }
  }

  confirmDelete(id: number): void { this.deletingId = id; this.showDeleteConfirm = true; }
  cancelDelete(): void            { this.deletingId = null; this.showDeleteConfirm = false; }

  doDelete(): void {
    if (!this.deletingId) return;
    this.budgetService.delete(this.deletingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.loadBudgets(); },
        error: () => { this.showDeleteConfirm = false; }
      });
  }

  getStatusClass(status: string): string {
    if (status === 'exceeded') return 'negative';
    if (status === 'warning')  return 'warning';
    return 'positive';
  }

  getBarWidth(pct: number): string { return `${Math.min(pct, 100)}%`; }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: this.currency, minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n);
  }

  private currentMonthValue(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
}