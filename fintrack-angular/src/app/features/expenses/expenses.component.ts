import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExpenseService, CategoryService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Transaction, Category, CategoryReport } from '../../core/models/models';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  expenses: Transaction[]       = [];
  topCategories: CategoryReport[] = [];
  categories: Category[]        = [];
  totalAmount = 0;
  count       = 0;
  loading     = true;
  loadingCats = true;

  filterForm!: FormGroup;

  get currency() { return this.authService.userCurrency; }

  get expenseCategories() { return this.categories.filter(c => c.type === 'Expense'); }
  get expenseCategoryOptions() {
    return [{ value: '', label: 'All Categories' }, ...this.expenseCategories.map(c => ({ value: c.id, label: c.name }))];
  }

  get currentMonthLabel(): string {
    const month = this.filterForm?.get('month')?.value;
    if (!month) return '';
    const [y, m] = month.split('-');
    return new Date(+y, +m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      month:      [this.currentMonthValue()],
      categoryId: ['']
    });

    this.loadCategories();
    this.loadExpenses();
    this.loadTopCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExpenses(): void {
    this.loading = true;
    const f = this.filterForm.value;
    this.expenseService.getAll(f.month || undefined, f.categoryId || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const list = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
          this.expenses    = list ?? [];
          this.totalAmount = res?.totalAmount ?? 0;
          this.count       = res?.count ?? this.expenses.length ?? 0;
          this.loading     = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
  }

  loadTopCategories(): void {
    this.loadingCats = true;
    const month = this.filterForm.get('month')?.value;
    this.expenseService.getTopCategories(month || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: cats => { this.topCategories = cats ?? []; this.loadingCats = false; this.cdr.markForCheck(); },
        error: () => { this.loadingCats = false; this.cdr.markForCheck(); }
      });
  }

  loadCategories(): void {
    this.categoryService.getAll('Expense')
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: cats => { this.categories = cats ?? []; this.cdr.markForCheck(); }, error: () => { this.cdr.markForCheck(); } });
  }

  applyFilters(): void {
    this.loadExpenses();
    this.loadTopCategories();
  }

  clearFilters(): void {
    this.filterForm.reset({ month: this.currentMonthValue(), categoryId: '' });
    this.applyFilters();
  }

  // ─── Helpers ────────────────────────────────
  formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'decimal',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(n);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getBarWidth(percentage: number): string {
    return `${Math.min(percentage, 100)}%`;
  }

  getCategoryColor(index: number): string {
    const colors = [
      'var(--negative)', 'var(--accent)', 'var(--info)',
      'var(--positive)', 'var(--purple)'
    ];
    return colors[index % colors.length];
  }

  private currentMonthValue(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  trackById(_: number, item: { id: number }): number { return item.id; }
  trackByIndex(i: number): number { return i; }
}