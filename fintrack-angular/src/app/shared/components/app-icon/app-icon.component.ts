import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: false,
  template: `
    <lucide-angular
      [name]="lucideName"
      [size]="size"
      [class]="iconClass">
    </lucide-angular>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  `]
})
export class AppIconComponent {
  @Input() name: string | null | undefined = '';
  @Input() size = 16;
  @Input() iconClass = '';

  /** Lucide expects kebab-case; we pass through and use 'circle' as fallback. */
  get lucideName(): string {
    const n = (this.name ?? '').trim();
    if (!n) return 'circle';
    return n.toLowerCase().replace(/\s+/g, '-');
  }
}
