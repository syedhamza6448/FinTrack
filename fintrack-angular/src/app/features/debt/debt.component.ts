import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DebtService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Debt, DebtRequest } from '../../core/models/models';

@Component({
    selector: 'app-debt',
    standalone: false,
    templateUrl: './debt.component.html',
    styleUrls: ['./debt.component.scss']
})
export class DebtComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    debts: Debt[] = [];
    loading = true;
    submitting = false;
    showModal = false;
    showPaymentModal = false;
    editingId: number | null = null;
    payingId: number | null = null;
    modalError = '';
    deletingId: number | null = null;
    showDeleteConfirm = false;

    debtForm!: FormGroup;
    paymentForm!: FormGroup;

    readonly types = ['Credit Card', 'Personal Loan', 'Mortgage', 'Car Loan', 'Student Loan', 'Medical', 'Other'];

    get currency() { return this.authService.userCurrency; }
    get modalTitle() { return this.editingId ? 'Edit Debt' : 'Add Debt'; }

    get totalDebt() { return this.debts.reduce((s, d) => s + d.balance, 0); }
    get totalOriginal() { return this.debts.reduce((s, d) => s + d.originalAmount, 0); }
    get totalMonthly() { return this.debts.reduce((s, d) => s + (d.minimumPayment ?? 0), 0); }
    get paidOffCount() { return this.debts.filter(d => d.status === 'PaidOff').length; }

    constructor(
        private fb: FormBuilder,
        private debtService: DebtService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.debtForm = this.fb.group({
            name: ['', Validators.required],
            type: ['Credit Card', Validators.required],
            originalAmount: [null, [Validators.required, Validators.min(1)]],
            balance: [null, [Validators.required, Validators.min(0)]],
            interestRate: [null, [Validators.min(0), Validators.max(100)]],
            minimumPayment: [null, Validators.min(0)],
            dueDate: [null],
            lender: [''],
            status: ['Active'],
            notes: ['']
        });
        this.paymentForm = this.fb.group({
            amount: [null, [Validators.required, Validators.min(0.01)]]
        });
        this.loadDebts();
    }

    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    loadDebts(): void {
        this.loading = true;
        this.debtService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.debts = Array.isArray(res) ? res : (res.debts ?? res.items ?? []) ?? [];
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => { this.loading = false; this.cdr.markForCheck(); }
            });
    }

    openAdd(): void {
        this.editingId = null; this.modalError = '';
        this.debtForm.reset({ name: '', type: 'Credit Card', originalAmount: null, balance: null, interestRate: null, minimumPayment: null, dueDate: null, lender: '', status: 'Active', notes: '' });
        this.showModal = true;
    }

    openEdit(d: Debt): void {
        this.editingId = d.id; this.modalError = '';
        this.debtForm.patchValue({
            name: d.name, type: d.type, originalAmount: d.originalAmount,
            balance: d.balance, interestRate: d.interestRate, minimumPayment: d.minimumPayment,
            dueDate: d.dueDate, lender: d.lender ?? '', status: d.status, notes: d.notes ?? ''
        });
        this.showModal = true;
    }

    closeModal(): void { this.showModal = false; }

    /** Map form value to API DebtRequest shape. */
    private toDebtRequest(): DebtRequest {
        const v = this.debtForm.value;
        const due = v.dueDate ? String(v.dueDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
        return {
            name: v.name,
            debtType: v.type,
            originalAmount: Number(v.originalAmount),
            remainingBalance: Number(v.balance),
            monthlyPayment: Number(v.minimumPayment) || 0,
            interestRate: Number(v.interestRate) || 0,
            startDate: due,
            expectedPayoffDate: v.dueDate ? String(v.dueDate).slice(0, 10) : undefined,
            priority: v.status === 'Overdue' ? 'High' : v.status === 'PaidOff' ? 'Low' : 'Medium'
        };
    }

    onSubmit(): void {
        if (this.debtForm.invalid) { this.debtForm.markAllAsTouched(); return; }
        this.submitting = true; this.modalError = '';

        const done = () => { this.submitting = false; this.showModal = false; this.loadDebts(); };
        const fail = (err: any) => { this.submitting = false; this.modalError = err.error?.message ?? 'Failed to save.'; };
        const body = this.toDebtRequest();

        if (this.editingId) {
            this.debtService.update(this.editingId, body)
                .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
        } else {
            this.debtService.create(body)
                .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
        }
    }

    openPayment(id: number): void {
        this.payingId = id;
        this.paymentForm.reset({ amount: null });
        this.showPaymentModal = true;
    }

    closePayment(): void { this.showPaymentModal = false; }

    onPayment(): void {
        if (this.paymentForm.invalid || !this.payingId) return;
        this.submitting = true;
        this.debtService.recordPayment(this.payingId, this.paymentForm.value.amount)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => { this.submitting = false; this.showPaymentModal = false; this.loadDebts(); },
                error: (err: any) => { this.submitting = false; this.modalError = err.error?.message ?? 'Payment failed.'; }
            });
    }

    confirmDelete(id: number): void { this.deletingId = id; this.showDeleteConfirm = true; }
    cancelDelete(): void { this.deletingId = null; this.showDeleteConfirm = false; }

    doDelete(): void {
        if (!this.deletingId) return;
        this.debtService.delete(this.deletingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.loadDebts(); },
                error: () => { this.showDeleteConfirm = false; }
            });
    }

    getProgressPct(d: Debt): number {
        if (!d.originalAmount) return 0;
        return Math.min(((d.originalAmount - d.balance) / d.originalAmount) * 100, 100);
    }

    getStatusClass(status: string): string {
        if (status === 'PaidOff') return 'paidoff';
        if (status === 'Overdue') return 'overdue';
        return 'active';
    }

    getTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            'Credit Card': '💳', 'Personal Loan': '🏦', Mortgage: '🏠',
            'Car Loan': '🚗', 'Student Loan': '🎓', Medical: '🏥', Other: '📄'
        };
        return icons[type] ?? '📄';
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency', currency: this.currency, minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(n);
    }

    trackById(_: number, item: { id: number }): number { return item.id; }
}