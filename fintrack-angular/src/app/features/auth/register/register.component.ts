import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error   = '';
  showPw  = false;

  currencies = [
    { value: 'NGN', label: 'NGN — Nigerian Naira',    symbol: '₦'   },
    { value: 'USD', label: 'USD — US Dollar',         symbol: '$'   },
    { value: 'GBP', label: 'GBP — British Pound',     symbol: '£'   },
    { value: 'EUR', label: 'EUR — Euro',              symbol: '€'   },
    { value: 'GHS', label: 'GHS — Ghanaian Cedi',     symbol: '₵'   },
    { value: 'KES', label: 'KES — Kenyan Shilling',   symbol: 'KSh' },
    { value: 'ZAR', label: 'ZAR — South African Rand',symbol: 'R'   }
  ];
  get registerCurrencyOptions() { return this.currencies.map(c => ({ value: c.value, label: c.label })); }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      currency:  ['NGN']
    });
  }

  get firstName() { return this.form.get('firstName')!; }
  get lastName()  { return this.form.get('lastName')!; }
  get email()     { return this.form.get('email')!; }
  get password()  { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';
    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        this.error   = err.error?.message ?? 'Registration failed. Please try again.';
      }
    });
  }
}