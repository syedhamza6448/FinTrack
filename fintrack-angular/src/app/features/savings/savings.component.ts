import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SavingsService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { SavingsGoal } from '../../core/models/models';

@Component({
  selector: 'app-savings',
  standalone: false,
  templateUrl: './savings.component.html',
  styleUrls: ['./savings.component.scss']
})
export class SavingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  goals: SavingsGoal[] = [];
  loading = true;
  submitting = false;
  showModal = false;
  showDepositModal = false;
  editingId: number | null = null;
  depositGoalId: number | null = null;
  modalError = '';
  deletingId: number | null = null;
  showDeleteConfirm = false;
  filterStatus = '';

  goalForm!: FormGroup;
  depositForm!: FormGroup;

  get currency() { return this.authService.userCurrency; }
  get modalTitle() { return this.editingId ? 'Edit Goal' : 'New Savings Goal'; }
  filterStatusOptions = [
    { value: '', label: 'All Goals' },
    { value: 'Active', label: 'Active' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Paused', label: 'Paused' }
  ];
  goalStatusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Paused', label: 'Paused' }
  ];

  get totalSaved() { return this.goals.reduce((s, g) => s + g.savedAmount, 0); }
  get totalTarget() { return this.goals.reduce((s, g) => s + g.targetAmount, 0); }
  get activeGoals() { return this.goals.filter(g => g.status === 'Active').length; }
  get completedGoals() { return this.goals.filter(g => g.status === 'Completed').length; }

  constructor(
    private fb: FormBuilder,
    private savingsService: SavingsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.goalForm = this.fb.group({
      name: ['', Validators.required],
      targetAmount: [null, [Validators.required, Validators.min(1)]],
      savedAmount: [0, [Validators.min(0)]],
      targetDate: [''],
      status: ['Active'],
      icon: ['target'],
      color: ['#B6FF3B']
    });
    this.depositForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]]
    });

    // Auto-update status to Completed when savedAmount >= targetAmount
    this.goalForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(values => {
      if (values.targetAmount && values.savedAmount >= values.targetAmount && this.goalForm.get('status')?.value !== 'Completed') {
        this.goalForm.get('status')?.setValue('Completed', { emitEvent: false });
      }
    });

    this.loadGoals();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadGoals(): void {
    this.loading = true;
    this.savingsService.getAll(this.filterStatus || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: goals => { this.goals = goals ?? []; this.loading = false; this.cdr.markForCheck(); },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
  }

  onFilterChange(): void { this.loadGoals(); }

  openAdd(): void {
    this.editingId = null; this.modalError = '';
    this.goalForm.reset({ name: '', targetAmount: null, savedAmount: 0, targetDate: '', status: 'Active', icon: 'target', color: '#B6FF3B' });
    this.showModal = true;
  }

  openEdit(g: SavingsGoal): void {
    this.editingId = g.id; this.modalError = '';
    this.goalForm.patchValue({
      name: g.name, targetAmount: g.targetAmount, savedAmount: g.savedAmount,
      targetDate: g.targetDate?.substring(0, 10) ?? '', status: g.status, icon: g.icon ?? 'target', color: g.color ?? '#B6FF3B'
    });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    if (this.goalForm.invalid) { this.goalForm.markAllAsTouched(); return; }
    this.submitting = true; this.modalError = '';

    const done = () => { this.submitting = false; this.showModal = false; this.loadGoals(); };
    const fail = (err: any) => { this.submitting = false; this.modalError = err.error?.message ?? 'Failed to save goal.'; };

    if (this.editingId) {
      this.savingsService.update(this.editingId, this.goalForm.value)
        .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
    } else {
      this.savingsService.create(this.goalForm.value)
        .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
    }
  }

  openDeposit(id: number): void {
    this.depositGoalId = id;
    this.depositForm.reset({ amount: null });
    this.showDepositModal = true;
  }

  closeDeposit(): void { this.showDepositModal = false; }

  onDeposit(): void {
    if (this.depositForm.invalid || !this.depositGoalId) return;
    this.submitting = true;
    this.savingsService.deposit(this.depositGoalId, this.depositForm.value.amount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.submitting = false; this.showDepositModal = false; this.loadGoals(); },
        error: (err: any) => { this.submitting = false; this.modalError = err.error?.message ?? 'Failed to deposit.'; }
      });
  }

  confirmDelete(id: number): void { this.deletingId = id; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.deletingId = null; this.showDeleteConfirm = false; }

  doDelete(): void {
    if (!this.deletingId) return;
    this.savingsService.delete(this.deletingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.loadGoals(); },
        error: () => { this.showDeleteConfirm = false; }
      });
  }

  getBarWidth(pct: number): string { return `${Math.min(pct, 100)}%`; }

  getStatusClass(status: string): string {
    if (status === 'Completed') return 'completed';
    if (status === 'Paused') return 'paused';
    return 'active';
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