import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { TransactionService, CategoryService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { AiService } from '../../core/services/ai.service';
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

    // ── Feature 6: Natural Language ──────────────────────────
    nlText = '';
    nlParsing = false;
    nlError = '';

    // ── Feature 13: Receipt Scanner ──────────────────────────
    receiptScanning = false;
    receiptError = '';

    // ── Feature 14: Bank Statement ───────────────────────────
    showStatementModal = false;
    statementParsing = false;
    statementError = '';
    statementTransactions: any[] = [];
    statementImporting = false;
    statementImportDone = false;

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
            ...this.incomeCategories.map(c => ({ value: c.id, label: `${c.name} (Income)`, icon: c.icon })),
            ...this.expenseCategories.map(c => ({ value: c.id, label: `${c.name} (Expense)`, icon: c.icon }))
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
        private aiService: AiService,
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
        this.nlText = ''; this.nlError = ''; this.receiptError = '';
        this.txnForm.reset({ description: '', amount: null, type: 'Expense', categoryId: null, date: this.todayValue(), notes: '' });
        this.showModal = true;
    }

    openEdit(txn: Transaction): void {
        this.editingId = txn.id; this.modalError = '';
        this.nlText = ''; this.nlError = ''; this.receiptError = '';
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
        this.txnService.delete(this.deletingId).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.loadTransactions(); },
            error: () => { this.showDeleteConfirm = false; }
        });
    }

    goToPage(p: number): void {
        if (p < 1 || p > this.totalPages) return;
        this.page = p; this.loadTransactions();
    }

    // ════════════════════════════════════════════════════════
    // FEATURE 6 — Natural Language Transaction Entry
    // ════════════════════════════════════════════════════════
    parseNaturalLanguage(): void {
        if (!this.nlText.trim()) return;
        this.nlParsing = true;
        this.nlError = '';
        this.aiService.parseTransaction(this.nlText).pipe(takeUntil(this.destroy$)).subscribe({
            next: (parsed) => {
                // Find matching category by name
                const match = this.categories.find(
                    c => c.name.toLowerCase() === parsed.category?.toLowerCase()
                );
                this.txnForm.patchValue({
                    description: parsed.description,
                    amount: parsed.amount,
                    type: parsed.type,
                    categoryId: match?.id ?? null,
                    date: parsed.date
                });
                this.nlParsing = false;
                this.nlText = '';
                this.cdr.markForCheck();
            },
            error: () => {
                this.nlError = 'Could not parse. Try rephrasing e.g. "Spent 5000 on groceries today"';
                this.nlParsing = false;
                this.cdr.markForCheck();
            }
        });
    }

    onNlKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter') { this.parseNaturalLanguage(); }
    }

    // ════════════════════════════════════════════════════════
    // FEATURE 13 — Receipt Scanner
    // ════════════════════════════════════════════════════════
    onReceiptSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        input.value = ''; // reset so same file can be selected again

        this.receiptScanning = true;
        this.receiptError = '';

        const formData = new FormData();
        formData.append('file', file);

        this.aiService.scanReceipt(formData).pipe(takeUntil(this.destroy$)).subscribe({
            next: (parsed) => {
                const match = this.categories.find(
                    c => c.name.toLowerCase() === parsed.category?.toLowerCase()
                );
                this.txnForm.patchValue({
                    description: parsed.description,
                    amount: parsed.amount,
                    type: parsed.type,
                    categoryId: match?.id ?? null,
                    date: parsed.date
                });
                this.receiptScanning = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.receiptError = 'Could not read receipt. Try a clearer image.';
                this.receiptScanning = false;
                this.cdr.markForCheck();
            }
        });
    }

    // ════════════════════════════════════════════════════════
    // FEATURE 14 — Bank Statement Parser
    // ════════════════════════════════════════════════════════
    onStatementSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        input.value = '';

        this.statementParsing = true;
        this.statementError = '';
        this.statementTransactions = [];
        this.statementImportDone = false;
        this.showStatementModal = true;

        const formData = new FormData();
        formData.append('file', file);

        this.aiService.parseStatement(formData).pipe(takeUntil(this.destroy$)).subscribe({
            next: (res) => {
                this.statementTransactions = res.transactions ?? [];
                this.statementParsing = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.statementError = 'Could not parse the statement. Try a clearer image or PDF.';
                this.statementParsing = false;
                this.cdr.markForCheck();
            }
        });
    }

    removeStatementTxn(index: number): void {
        this.statementTransactions.splice(index, 1);
    }

    importAllStatementTxns(): void {
        if (this.statementTransactions.length === 0) return;
        this.statementImporting = true;

        // Map parsed transactions to API format
        const toImport = this.statementTransactions
            .map(t => {
                const match = this.categories.find(
                    c => c.name.toLowerCase() === t.category?.toLowerCase()
                );
                return {
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    categoryId: match?.id as number,
                    date: t.date,
                    notes: 'Imported from bank statement'
                };
            })
            .filter(t => t.categoryId);

        // Import one by one sequentially
        let completed = 0;
        const total = toImport.length;

        toImport.forEach(txn => {
            this.txnService.create(txn).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    completed++;
                    if (completed === total) {
                        this.statementImporting = false;
                        this.statementImportDone = true;
                        this.loadTransactions();
                        this.cdr.markForCheck();
                    }
                },
                error: () => {
                    completed++;
                    if (completed === total) {
                        this.statementImporting = false;
                        this.statementImportDone = true;
                        this.loadTransactions();
                        this.cdr.markForCheck();
                    }
                }
            });
        });
    }

    closeStatementModal(): void {
        this.showStatementModal = false;
        this.statementTransactions = [];
        this.statementError = '';
        this.statementImportDone = false;
    }

    // ── Helpers ──────────────────────────────────────────────
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(d: string): string {
        return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    getTypeClass(type: string): string { return type === 'Income' ? 'income' : 'expense'; }
    private todayValue(): string { return today(); }
    private currentMonthValue(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    trackById(_: number, item: { id: number }): number { return item.id; }
}