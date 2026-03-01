import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TransactionService, CategoryService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Transaction, Category, PaginationParams } from '../../core/models/models';
import { today } from '../../shared/utils/date.util';
import { extractError } from '../../shared/utils/error.util';

@Component({
    selector: 'app-transactions',
    standalone: false,
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    transactions: Transaction[] = [];
    categories: Category[] = [];
    total = 0;
    loading = true;
    submitting = false;
    error = '';

    page = 1;
    pageSize = 15;
    get totalPages(): number { return Math.ceil(this.total / this.pageSize); }
    get pages(): number[] {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) pages.push(i);
        return pages;
    }

    filterForm!: FormGroup;
    showModal = false;
    editingId: number | null = null;
    txnForm!: FormGroup;
    modalError = '';
    deletingId: number | null = null;
    showDeleteConfirm = false;

    get currency() { return this.authService.userCurrency; }
    get incomeCategories() { return this.categories.filter(c => c.type === 'Income'); }
    get expenseCategories() { return this.categories.filter(c => c.type === 'Expense'); }
    get modalTitle(): string { return this.editingId ? 'Edit Transaction' : 'Add Transaction'; }
    filterTypeOptions = [
        { value: '', label: 'All Types' },
        { value: 'Income', label: 'Income' },
        { value: 'Expense', label: 'Expense' }
    ];
    get filterCategoryOptions() {
        return [
            { value: '', label: 'All Categories' },
      ...this.incomeCategories.map(c => ({
        value: c.id,
        label: `${c.name} (Income)`,
        icon: c.icon
      })),
      ...this.expenseCategories.map(c => ({
        value: c.id,
        label: `${c.name} (Expense)`,
        icon: c.icon
      }))
        ];
    }
    get modalCategoryOptions() {
        const type = this.txnForm?.get('type')?.value;
        const cats = type === 'Income' ? this.incomeCategories : this.expenseCategories;
    return cats.map(c => ({ value: c.id, label: c.name, icon: c.icon }));
    }

    constructor(
        private fb: FormBuilder,
        private txnService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.buildForms();
        this.loadCategories();
        this.loadTransactions();
        this.filterForm.get('search')!.valueChanges.pipe(
            debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$)
        ).subscribe(() => { this.page = 1; this.loadTransactions(); });
        this.txnForm.get('type')!.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.txnForm.patchValue({ categoryId: null });
        });
    }

    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    private buildForms(): void {
        this.filterForm = this.fb.group({
            search: [''], type: [''], categoryId: [''], month: [this.currentMonthValue()]
        });
        this.txnForm = this.fb.group({
            description: ['', Validators.required],
            amount: [null, [Validators.required, Validators.min(0.01)]],
            type: ['Expense', Validators.required],
            categoryId: [null, Validators.required],
        date: [this.todayValue(), Validators.required],
            notes: ['']
        });
    }

    loadTransactions(): void {
        this.loading = true;
        const f = this.filterForm.value;
        const params: PaginationParams = {
            page: this.page, pageSize: this.pageSize,
            search: f.search || undefined, type: f.type || undefined,
            categoryId: f.categoryId ? Number(f.categoryId) : undefined, month: f.month || undefined
        };
        this.txnService.getAll(params).pipe(takeUntil(this.destroy$)).subscribe({
            next: res => {
                const items = res?.items ?? (res as any)?.data ?? (Array.isArray(res) ? res : []);
                this.transactions = items ?? [];
                this.total = res?.total ?? this.transactions.length ?? 0;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.error = 'Failed to load transactions.';
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    loadCategories(): void {
        this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
            next: cats => { this.categories = cats ?? []; this.cdr.markForCheck(); },
            error: () => { this.cdr.markForCheck(); }
        });
    }

    applyFilters(): void { this.page = 1; this.loadTransactions(); }

    clearFilters(): void {
        this.filterForm.reset({ search: '', type: '', categoryId: '', month: this.currentMonthValue() });
        this.page = 1; this.loadTransactions();
    }

    openAdd(): void {
        this.editingId = null; this.modalError = '';
        this.txnForm.reset({ description: '', amount: null, type: 'Expense', categoryId: null, date: this.todayValue(), notes: '' });
        this.showModal = true;
    }

    openEdit(txn: Transaction): void {
        this.editingId = txn.id; this.modalError = '';
        this.txnForm.patchValue({
            description: txn.description, amount: txn.amount, type: txn.type,
            categoryId: txn.categoryId, date: txn.date.substring(0, 10), notes: txn.notes ?? ''
        });
        this.showModal = true;
    }

    closeModal(): void { this.showModal = false; }

    onSubmit(): void {
        if (this.txnForm.invalid) { this.txnForm.markAllAsTouched(); return; }
        this.submitting = true; this.modalError = '';

    const done = () => { this.submitting = false; this.showModal = false; this.loadTransactions(); };
    const fail = (err: any) => { this.submitting = false; this.modalError = extractError(err); };

        if (this.editingId) {
            this.txnService.update(this.editingId, this.txnForm.value)
                .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
        } else {
            this.txnService.create(this.txnForm.value)
                .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
        }
    }

    confirmDelete(id: number): void { this.deletingId = id; this.showDeleteConfirm = true; }
    cancelDelete(): void { this.deletingId = null; this.showDeleteConfirm = false; }

    doDelete(): void {
        if (!this.deletingId) return;
        this.txnService.delete(this.deletingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.loadTransactions(); },
                error: () => { this.showDeleteConfirm = false; }
            });
    }

    goToPage(p: number): void {
        if (p < 1 || p > this.totalPages) return;
        this.page = p; this.loadTransactions();
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency', currency: this.currency, minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(d: string): string {
        return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    getTypeClass(type: string): string { return type === 'Income' ? 'income' : 'expense'; }
  private todayValue(): string { return today(); }
    private currentMonthValue(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    trackById(_: number, item: { id: number }): number { return item.id; }
}