import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit {
  @Input() appTooltip: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'app-tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipPosition}`);
    this.renderer.setProperty(this.tooltipElement, 'textContent', this.appTooltip);
    this.renderer.appendChild(document.body, this.tooltipElement);
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.appTooltip || !this.tooltipElement) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const offset = 8;
    const padding = 10;
    let top = 0;
    let left = 0;
    let position = this.tooltipPosition;

    // Calculate position based on viewport
    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - offset;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        // Fallback to bottom if not enough space at top
        if (top < padding) {
          position = 'bottom';
          top = rect.bottom + offset;
        }
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        // Fallback to top if not enough space at bottom
        if (top + tooltipRect.height > window.innerHeight - padding) {
          position = 'top';
          top = rect.top - tooltipRect.height - offset;
        }
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.left - tooltipRect.width - offset;
        // Fallback to right if not enough space at left
        if (left < padding) {
          position = 'right';
          left = rect.right + offset;
        }
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2;
        left = rect.right + offset;
        // Fallback to left if not enough space at right
        if (left + tooltipRect.width > window.innerWidth - padding) {
          position = 'left';
          left = rect.left - tooltipRect.width - offset;
        }
        break;
    }

    // Clamp horizontal position to viewport
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    // Clamp vertical position to viewport
    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding;
    }

    // Update arrow position class if it changed
    if (position !== this.tooltipPosition) {
      this.renderer.removeClass(this.tooltipElement, `tooltip-${this.tooltipPosition}`);
      this.renderer.addClass(this.tooltipElement, `tooltip-${position}`);
    }

    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'visible');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '9999');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.tooltipElement) return;
    this.renderer.setStyle(this.tooltipElement, 'visibility', 'hidden');
    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
  }
}
