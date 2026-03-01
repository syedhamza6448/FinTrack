import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AppDropdownOption {
  value: any;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: false,
  templateUrl: './app-dropdown.component.html',
  styleUrls: ['./app-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AppDropdownComponent,
      multi: true
    }
  ]
})
export class AppDropdownComponent implements ControlValueAccessor {
  @Input() options: AppDropdownOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() disabled = false;
  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();

  @ViewChild('panel') panelRef!: ElementRef<HTMLElement>;

  open = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedOption(): AppDropdownOption | null {
    if (this.value == null) return null;
    return this.options.find(o => o.value === this.value) ?? null;
  }

  get displayLabel(): string {
    const opt = this.selectedOption;
    return opt ? opt.label : this.placeholder;
  }

  trackByValue(_: number, opt: AppDropdownOption): any {
    return opt.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const el = this.elementRef.nativeElement;
    if (this.open && !el.contains(event.target as Node)) {
      this.open = false;
    }
  }

  constructor(private elementRef: ElementRef) {}

  toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
    if (this.open) this.onTouched();
  }

  select(option: AppDropdownOption): void {
    const newVal = option.value;
    this.value = newVal;
    this.onChange(newVal);
    this.valueChange.emit(newVal);
    this.open = false;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
