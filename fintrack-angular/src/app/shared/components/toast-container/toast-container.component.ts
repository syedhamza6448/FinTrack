import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: false,
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts; trackBy: trackById"
        class="toast toast-{{ toast.type }}"
        (click)="dismiss(toast.id)">
        <div class="toast-icon">
          <lucide-angular [name]="toast.icon" [size]="16"></lucide-angular>
        </div>
        <div class="toast-body">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-msg">{{ toast.message }}</div>
        </div>
        <button class="toast-close" (click)="dismiss(toast.id)">
          <lucide-angular name="x" [size]="13"></lucide-angular>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
      width: calc(100vw - 40px);
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border-radius: var(--r-lg);
      border: 1px solid;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-float);
      cursor: pointer;
      pointer-events: all;
      animation: toast-in 0.3s var(--ease-out-expo) both;
      transition: opacity 0.2s, transform 0.2s;

      &:hover { opacity: 0.9; }
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: none; }
    }

    .toast-warning {
      background: var(--bg-raised);
      border-color: rgba(255, 181, 71, 0.3);
      .toast-icon { color: var(--warning); background: var(--warning-dim); }
    }

    .toast-danger {
      background: var(--bg-raised);
      border-color: rgba(242, 92, 110, 0.3);
      .toast-icon { color: var(--negative); background: var(--negative-dim); }
    }

    .toast-success {
      background: var(--bg-raised);
      border-color: rgba(62, 207, 142, 0.3);
      .toast-icon { color: var(--positive); background: var(--positive-dim); }
    }

    .toast-info {
      background: var(--bg-raised);
      border-color: rgba(91, 156, 246, 0.3);
      .toast-icon { color: var(--info); background: var(--info-dim); }
    }

    .toast-icon {
      width: 30px;
      height: 30px;
      border-radius: var(--r-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast-body { flex: 1; min-width: 0; }

    .toast-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 2px;
      font-family: var(--font-display);
    }

    .toast-msg {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-tertiary);
      padding: 2px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-top: 1px;
      transition: color var(--t-fast);
      &:hover { color: var(--text-primary); }
    }

    @media (max-width: 768px) {
      .toast-container {
        bottom: 76px;
        right: 12px;
        left: 12px;
        width: auto;
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  trackById(_: number, item: Toast): number { return item.id; }
}
