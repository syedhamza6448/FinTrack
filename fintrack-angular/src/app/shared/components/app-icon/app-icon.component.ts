import { Component, Input } from '@angular/core';

/**
 * Renders either an emoji (if name looks like one) or a Lucide icon by name.
 * Use for category icons, transaction icons, etc. where API may return
 * Lucide icon name (e.g. "wallet") or emoji (e.g. "💰").
 */
@Component({
  selector: 'app-icon',
  standalone: false,
  template: `
    @if (isEmoji) {
      <span class="app-icon-emoji" [style.font-size.px]="size">{{ name }}</span>
    } @else {
      <lucide-angular [name]="lucideName" [size]="size" [class]="iconClass"></lucide-angular>
    }
  `,
  styles: [`
    .app-icon-emoji { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
  `]
})
export class AppIconComponent {
  @Input() name: string | null | undefined = '';
  @Input() size = 16;
  @Input() iconClass = '';

  get isEmoji(): boolean {
    const n = (this.name ?? '').trim();
    if (!n) return false;
    // Single character or two (e.g. emoji with modifier), or common emoji patterns
    if (n.length <= 2) return true;
    // Unicode emoji range (simplified: many emojis are 1-2 code points)
    const first = n.codePointAt(0);
    if (first != null && (first >= 0x1F300 && first <= 0x1F9FF)) return true;
    return false;
  }

  /** Lucide expects kebab-case; we pass through and use 'circle' as fallback. */
  get lucideName(): string {
    const n = (this.name ?? '').trim();
    if (!n) return 'circle';
    return n.toLowerCase().replace(/\s+/g, '-');
  }
}
