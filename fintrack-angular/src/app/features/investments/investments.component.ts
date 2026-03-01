import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InvestmentService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Investment } from '../../core/models/models';

@Component({
    selector: 'app-investments',
    standalone: false,
    templateUrl: './investments.component.html',
    styleUrls: ['./investments.component.scss']
})
export class InvestmentsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    investments: Investment[] = [];
    loading = true;
    submitting = false;
    showModal = false;
    editingId: number | null = null;
    modalError = '';
    deletingId: number | null = null;
    showDeleteConfirm = false;

    investForm!: FormGroup;

    readonly types = ['Stocks', 'Crypto', 'Bonds', 'Real Estate', 'Mutual Funds', 'ETF', 'Other'];

    get currency() { return this.authService.userCurrency; }
    get modalTitle() { return this.editingId ? 'Edit Investment' : 'Add Investment'; }

    get totalInvested() { return this.investments.reduce((s, i) => s + i.amountInvested, 0); }
    get totalValue() { return this.investments.reduce((s, i) => s + i.currentValue, 0); }
    get totalGain() { return this.totalValue - this.totalInvested; }
    get totalGainPct() { return this.totalInvested > 0 ? (this.totalGain / this.totalInvested) * 100 : 0; }

    constructor(
        private fb: FormBuilder,
        private investService: InvestmentService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.investForm = this.fb.group({
            name: ['', Validators.required],
            type: ['Stocks', Validators.required],
            amountInvested: [null, [Validators.required, Validators.min(0.01)]],
            currentValue: [null, [Validators.required, Validators.min(0)]],
            units: [null],
            purchasePrice: [null],
            currentPrice: [null],
            purchaseDate: [''],
            notes: ['']
        });
        this.loadInvestments();
    }

    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    loadInvestments(): void {
        this.loading = true;
        this.investService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.investments = Array.isArray(res) ? res : (res.investments ?? res.items ?? []) ?? [];
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => { this.loading = false; this.cdr.markForCheck(); }
            });
    }

    openAdd(): void {
        this.editingId = null; this.modalError = '';
        this.investForm.reset({ name: '', type: 'Stocks', amountInvested: null, currentValue: null, units: null, purchasePrice: null, currentPrice: null, purchaseDate: '', notes: '' });
        this.showModal = true;
    }

    openEdit(inv: Investment): void {
        this.editingId = inv.id; this.modalError = '';
        this.investForm.patchValue({
            name: inv.name, type: inv.type,
            amountInvested: inv.amountInvested, currentValue: inv.currentValue,
            units: inv.units, purchasePrice: inv.purchasePrice, currentPrice: inv.currentPrice,
            purchaseDate: inv.purchaseDate?.substring(0, 10) ?? '', notes: inv.notes ?? ''
        });
        this.showModal = true;
    }

    closeModal(): void { this.showModal = false; }

    onSubmit(): void {
        if (this.investForm.invalid) { this.investForm.markAllAsTouched(); return; }
        this.submitting = true; this.modalError = '';

        const done = () => { this.submitting = false; this.showModal = false; this.loadInvestments(); };
        const fail = (err: any) => { this.submitting = false; this.modalError = err.error?.message ?? 'Failed to save.'; };

        if (this.editingId) {
            this.investService.update(this.editingId, this.investForm.value)
                .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
        } else {
            this.investService.create(this.investForm.value)
                .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
        }
    }

    confirmDelete(id: number): void { this.deletingId = id; this.showDeleteConfirm = true; }
    cancelDelete(): void { this.deletingId = null; this.showDeleteConfirm = false; }

    doDelete(): void {
        if (!this.deletingId) return;
        this.investService.delete(this.deletingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.loadInvestments(); },
                error: () => { this.showDeleteConfirm = false; }
            });
    }

    getGainClass(gain: number): string { return gain >= 0 ? 'positive' : 'negative'; }
    getTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            Stocks: '📈', Crypto: '₿', Bonds: '📄', 'Real Estate': '🏠',
            'Mutual Funds': '💼', ETF: '📊', Other: '💰'
        };
        return icons[type] ?? '💰';
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency', currency: this.currency, minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(n);
    }

    formatDate(d: string): string {
        return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    trackById(_: number, item: { id: number }): number { return item.id; }
}