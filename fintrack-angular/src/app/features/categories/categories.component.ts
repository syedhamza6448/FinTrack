import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../core/services/api.services';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: false,
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categories: Category[]   = [];
  loading                  = true;
  submitting               = false;
  showModal                = false;
  editingId: number | null = null;
  modalError               = '';
  deletingId: number | null = null;
  showDeleteConfirm        = false;
  filterType               = '';

  catForm!: FormGroup;

  readonly icons = ['home', 'car', 'utensils', 'shopping-cart', 'heart', 'graduation-cap', 'plane', 'film', 'lightbulb', 'smartphone', 'dollar-sign', 'briefcase', 'gift', 'dumbbell', 'wrench', 'gamepad-2', 'coffee', 'sprout', 'package', 'wallet', 'tag', 'book'];

  categoryTypeOptions = [
    { value: 'Expense', label: 'Expense' },
    { value: 'Income', label: 'Income' }
  ];

  get modalTitle() { return this.editingId ? 'Edit Category' : 'New Category'; }
  get expenseCategories() { return this.categories.filter(c => c.type === 'Expense'); }
  get incomeCategories()  { return this.categories.filter(c => c.type === 'Income'); }
  get filteredCategories() {
    if (!this.filterType) return this.categories;
    return this.categories.filter(c => c.type === this.filterType);
  }

  constructor(private fb: FormBuilder, private categoryService: CategoryService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.catForm = this.fb.group({
      name:  ['', Validators.required],
      type:  ['Expense', Validators.required],
      icon:  ['package'],
      color: ['#f5a623']
    });
    this.loadCategories();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.categories = Array.isArray(res) ? res : (res.categories ?? res.items ?? []) ?? [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
  }

  openAdd(): void {
    this.editingId = null; this.modalError = '';
    this.catForm.reset({ name: '', type: 'Expense', icon: 'package', color: '#f5a623' });
    this.showModal = true;
  }

  openEdit(c: Category): void {
    this.editingId = c.id; this.modalError = '';
    this.catForm.patchValue({ name: c.name, type: c.type, icon: c.icon ?? 'package', color: c.color ?? '#f5a623' });
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onSubmit(): void {
    if (this.catForm.invalid) { this.catForm.markAllAsTouched(); return; }
    this.submitting = true; this.modalError = '';

    const done = () => { this.submitting = false; this.showModal = false; this.loadCategories(); };
    const fail = (err: any) => { this.submitting = false; this.modalError = err.error?.message ?? 'Failed to save.'; };

    if (this.editingId) {
      this.categoryService.update(this.editingId, this.catForm.value)
        .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
    } else {
      this.categoryService.create(this.catForm.value)
        .pipe(takeUntil(this.destroy$)).subscribe({ next: done, error: fail });
    }
  }

  confirmDelete(id: number): void { this.deletingId = id; this.showDeleteConfirm = true; }
  cancelDelete(): void            { this.deletingId = null; this.showDeleteConfirm = false; }

  doDelete(): void {
    if (!this.deletingId) return;
    this.categoryService.delete(this.deletingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.showDeleteConfirm = false; this.deletingId = null; this.loadCategories(); },
        error: () => { this.showDeleteConfirm = false; }
      });
  }

  selectIcon(icon: string): void { this.catForm.get('icon')?.setValue(icon); }

  trackById(_: number, item: { id: number }): number { return item.id; }
  trackByIndex(i: number): number { return i; }
}