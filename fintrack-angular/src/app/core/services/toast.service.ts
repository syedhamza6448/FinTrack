import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'warning' | 'danger' | 'success' | 'info';
  title: string;
  message: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(type: Toast['type'], title: string, message: string, icon?: string): void {
    const iconMap: Record<Toast['type'], string> = {
      warning: 'alert-triangle',
      danger: 'alert-circle',
      success: 'check-circle',
      info: 'info'
    };
    const toast: Toast = {
      id: ++this.counter,
      type,
      title,
      message,
      icon: icon ?? iconMap[type]
    };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);
    setTimeout(() => this.dismiss(toast.id), 5000);
  }

  dismiss(id: number): void {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }
}
