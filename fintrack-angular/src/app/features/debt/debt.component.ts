import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DebtService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Debt, DebtRequest } from '../../core/models/models';
import { extractError } from '../../shared/utils/error.util';

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

    readonly debtTypes = [
        'Credit Card', 'Personal Loan', 'Mortgage',
        'Car Loan', 'Student Loan', 'Medical', 'Other'
    ];

    get currency() { return this.authService.userCurrency; }
    get modalTitle() { return this.editingId ? 'Edit Debt' : 'Add Debt'; }

    get totalDebt() { return this.debts.reduce((s, d) => s + d.balance, 0); }
    get totalOriginal() { return this.debts.reduce((s, d) => s + d.originalAmount, 0); }
    get totalMonthly() { return this.debts.reduce((s, d) => s + (d.minimumPayment ?? 0), 0); }

    constructor(
        private fb: FormBuilder,
        private debtService: DebtService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.debtForm = this.fb.group({
            name: ['', Validators.required],
            debtType: ['Credit Card', Validators.required],
            originalAmount: [null, [Validators.required, Validators.min(1)]],
            remainingBalance: [null, [Validators.required, Validators.min(0)]],
            monthlyPayment: [null, [Validators.required, Validators.min(1)]],
            interestRate: [0, [Validators.required, Validators.min(0)]],
            startDate: ['', Validators.required],
            expectedPayoffDate: [''],
            priority: ['Medium', Validators.required]
        });

        this.paymentForm = this.fb.group({
            amount: [null, [Validators.required, Validators.min(0.01)]]
        });

        // When originalAmount changes and creating a new debt, sync remainingBalance
        this.debtForm.get('originalAmount')!.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(val => {
                if (!this.editingId) {
                    this.debtForm.get('remainingBalance')!.setValue(val, { emitEvent: false });
                }
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
                    this.debts = Array.isArray(res) ? res : (res.debts ?? res.items ?? []);
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => { this.loading = false; this.cdr.markForCheck(); }
            });
    }

    openAdd(): void {
        this.editingId = null; this.modalError = '';
        this.debtForm.reset({
            name: '', debtType: 'Credit Card', originalAmount: null, remainingBalance: null,
            monthlyPayment: null, interestRate: 0, startDate: '', expectedPayoffDate: '', priority: 'Medium'
        });
        this.showModal = true;
    }

    openEdit(d: Debt): void {
        this.editingId = d.id; this.modalError = '';
        this.debtForm.patchValue({
            name: d.name,
            debtType: d.type,
            originalAmount: d.originalAmount,
            remainingBalance: d.balance,
            monthlyPayment: d.minimumPayment ?? (d as any).monthlyPayment ?? null,
            interestRate: d.interestRate,
            startDate: d.dueDate ? String(d.dueDate).slice(0, 10) : ((d as any).startDate ? String((d as any).startDate).slice(0, 10) : ''),
            expectedPayoffDate: (d as any).expectedPayoffDate ? String((d as any).expectedPayoffDate).slice(0, 10) : '',
            priority: (d as any).priority ?? 'Medium'
        });
        this.showModal = true;
    }

    closeModal(): void { this.showModal = false; }

    onSubmit(): void {
        if (this.debtForm.invalid) { this.debtForm.markAllAsTouched(); return; }
        this.submitting = true; this.modalError = '';

        const v = this.debtForm.value;
        const body: DebtRequest = {
            name: v.name,
            debtType: v.debtType,
            originalAmount: Number(v.originalAmount),
            remainingBalance: Number(v.remainingBalance),
            monthlyPayment: Number(v.monthlyPayment),
            interestRate: Number(v.interestRate) || 0,
            startDate: v.startDate,
            expectedPayoffDate: v.expectedPayoffDate || undefined,
            priority: v.priority
        };

        const done = () => { this.submitting = false; this.showModal = false; this.loadDebts(); };
        const fail = (err: any) => { this.submitting = false; this.modalError = extractError(err); };

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
                error: (err: any) => { this.submitting = false; this.modalError = extractError(err); }
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

    getPriorityIcon(p: string): string {
        if (p === 'High') return 'alert-circle';
        if (p === 'Medium') return 'alert-triangle';
        return 'check-circle-2';
    }

    getProgressPct(d: Debt): number {
        if (!d.originalAmount) return 0;
        return Math.min(((d.originalAmount - d.balance) / d.originalAmount) * 100, 100);
    }

    getTypeIcon(type: string): string {
        const map: Record<string, string> = {
            'Credit Card': 'credit-card', 'Personal Loan': 'wallet', Mortgage: 'home',
            'Car Loan': 'car', 'Student Loan': 'graduation-cap', Medical: 'building2', Other: 'file-text'
        };
        return map[type] ?? 'file-text';
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency', currency: this.currency,
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(n);
    }

    trackById(_: number, item: { id: number }): number { return item.id; }
}