import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  standalone: false,
})
export class ColorPickerComponent {
  @Input() selected = '#B6FF3B';
  @Output() colorSelected = new EventEmitter<string>();

  colors = [
    { hex: '#B6FF3B', label: 'Electric Lime' },
    { hex: '#3ecf8e', label: 'Emerald' },
    { hex: '#5b9cf6', label: 'Sky Blue' },
    { hex: '#a78bfa', label: 'Violet' },
    { hex: '#f25c6e', label: 'Rose' },
    { hex: '#ffb547', label: 'Amber' },
    { hex: '#f5a623', label: 'Gold' },
    { hex: '#06b6d4', label: 'Cyan' },
    { hex: '#ec4899', label: 'Pink' },
    { hex: '#84cc16', label: 'Lime' },
    { hex: '#ffffff', label: 'White' },
    { hex: '#94a3b8', label: 'Slate' },
  ];

  get colorLabel(): string {
    return this.colors.find((c) => c.hex === this.selected)?.label ?? 'Custom';
  }

  isLight(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 160;
  }

  isPredefinedColor(hex: string): boolean {
    return this.colors.some(c => c.hex.toLowerCase() === hex?.toLowerCase());
  }

  onCustomColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.value) {
      this.select(input.value);
    }
  }

  select(hex: string): void {
    this.colorSelected.emit(hex);
  }
}

