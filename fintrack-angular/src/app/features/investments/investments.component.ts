import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InvestmentService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { Investment, InvestmentRequest } from '../../core/models/models';
import { extractError } from '../../shared/utils/error.util';

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

    readonly assetTypes = ['Stocks', 'Crypto', 'Bonds', 'Real Estate', 'Mutual Funds', 'ETF', 'Other'];

    get currency() { return this.authService.userCurrency; }
    get modalTitle() { return this.editingId ? 'Edit Investment' : 'Add Investment'; }

    // Computed gain/loss preview from form values
    get previewGain(): number {
        const v = this.investForm?.value;
        if (!v) return 0;
        const qty = Number(v.quantity) || 0;
        const buy = Number(v.buyPrice) || 0;
        const curr = Number(v.currentPrice) || 0;
        return (curr - buy) * qty;
    }
    get previewGainPct(): number {
        const v = this.investForm?.value;
        const qty = Number(v?.quantity) || 0;
        const buy = Number(v?.buyPrice) || 0;
        const cost = buy * qty;
        return cost > 0 ? (this.previewGain / cost) * 100 : 0;
    }
    get previewPositive(): boolean { return this.previewGain >= 0; }

    // Portfolio totals from loaded data
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
            ticker: ['', Validators.required],
            assetType: ['Stocks', Validators.required],
            quantity: [null, [Validators.required, Validators.min(0.0001)]],
            buyPrice: [null, [Validators.required, Validators.min(0.01)]],
            currentPrice: [null, [Validators.required, Validators.min(0.01)]],
            purchaseDate: ['', Validators.required],
            dividendEarned: [0]
        });
        this.loadInvestments();
    }

    ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

    onTickerInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const upper = input.value.toUpperCase();
        this.investForm.get('ticker')!.setValue(upper, { emitEvent: false });
        input.value = upper;
    }

    loadInvestments(): void {
        this.loading = true;
        this.investService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res: any) => {
                    this.investments = Array.isArray(res) ? res : (res.investments ?? res.items ?? []);
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => { this.loading = false; this.cdr.markForCheck(); }
            });
    }

    openAdd(): void {
        this.editingId = null; this.modalError = '';
        this.investForm.reset({
            name: '', ticker: '', assetType: 'Stocks',
            quantity: null, buyPrice: null, currentPrice: null,
            purchaseDate: '', dividendEarned: 0
        });
        this.showModal = true;
    }

    openEdit(inv: Investment): void {
        this.editingId = inv.id; this.modalError = '';
        // Map from display model back to form fields
        this.investForm.patchValue({
            name: inv.name,
            ticker: (inv as any).ticker ?? '',
            assetType: (inv as any).assetType ?? inv.type ?? 'Stocks',
            quantity: inv.units ?? (inv as any).quantity ?? null,
            buyPrice: inv.purchasePrice ?? (inv as any).buyPrice ?? null,
            currentPrice: inv.currentPrice ?? null,
            purchaseDate: inv.purchaseDate?.substring(0, 10) ?? '',
            dividendEarned: (inv as any).dividendEarned ?? 0
        });
        this.showModal = true;
    }

    closeModal(): void { this.showModal = false; }

    onSubmit(): void {
        if (this.investForm.invalid) { this.investForm.markAllAsTouched(); return; }
        this.submitting = true; this.modalError = '';

        const v = this.investForm.value;
        const body: InvestmentRequest = {
            name: v.name,
            ticker: v.ticker.toUpperCase(),
            assetType: v.assetType,
            quantity: Number(v.quantity),
            buyPrice: Number(v.buyPrice),
            currentPrice: Number(v.currentPrice),
            purchaseDate: v.purchaseDate,
            dividendEarned: Number(v.dividendEarned) || 0
        };

        const done = () => { this.submitting = false; this.showModal = false; this.loadInvestments(); };
        const fail = (err: any) => { this.submitting = false; this.modalError = extractError(err); };

        if (this.editingId) {
            this.investService.update(this.editingId, body)
                .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
        } else {
            this.investService.create(body)
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

    getGainClass(n: number): string { return n >= 0 ? 'positive' : 'negative'; }

    getTypeIcon(type: string): string {
        const map: Record<string, string> = {
            Stocks: 'trending-up', Crypto: 'dollar-sign', Bonds: 'file-text',
            'Real Estate': 'home', 'Mutual Funds': 'briefcase', ETF: 'bar-chart-2', Other: 'wallet'
        };
        return map[type] ?? 'wallet';
    }

    formatCurrency(n: number): string {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency', currency: this.currency,
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(n);
    }

    formatDate(d: string): string {
        return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    trackById(_: number, item: { id: number }): number { return item.id; }
}