import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab       = 'profile';
  savingProfile   = false;
  savingPassword  = false;
  profileSuccess  = '';
  profileError    = '';
  passwordSuccess = '';
  passwordError   = '';
  showCurrentPw   = false;
  showNewPw       = false;
  showConfirmPw   = false;

  profileForm!:  FormGroup;
  passwordForm!: FormGroup;

  readonly currencies = [
    { code: 'NGN', label: 'Nigerian Naira (₦)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
    { code: 'KES', label: 'Kenyan Shilling (KSh)' },
    { code: 'ZAR', label: 'South African Rand (R)' },
    { code: 'CAD', label: 'Canadian Dollar (CA$)' },
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;

    this.profileForm = this.fb.group({
      fullName: [user?.fullName ?? '', Validators.required],
      email:    [user?.email    ?? '', [Validators.required, Validators.email]],
      currency: [user?.currency ?? 'NGN'],
      phone:    [''],
      timezone: ['Africa/Lagos']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });

    // Load latest settings from API
    this.settingsService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (s: any) => {
          this.profileForm.patchValue({
            fullName: s.fullName ?? s.name ?? '',
            email:    s.email    ?? '',
            currency: s.currency ?? 'NGN',
            phone:    s.phone    ?? '',
            timezone: s.timezone ?? 'Africa/Lagos'
          });
        },
        error: () => {}
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.profileSuccess = this.profileError = this.passwordSuccess = this.passwordError = '';
  }

  // Typed getters for use with [formControl] in template
  get currencyControl(): FormControl  { return this.profileForm.get('currency') as FormControl; }
  get timezoneControl(): FormControl  { return this.profileForm.get('timezone') as FormControl; }

  onSaveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true;
    this.profileSuccess = this.profileError = '';

    this.settingsService.updateProfile(this.profileForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.savingProfile  = false;
          this.profileSuccess = 'Profile updated successfully!';
          this.authService.updateCurrentUser(this.profileForm.value);
          setTimeout(() => this.profileSuccess = '', 3000);
        },
        error: (err: any) => {
          this.savingProfile = false;
          this.profileError  = err.error?.message ?? 'Failed to update profile.';
        }
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.savingPassword = true;
    this.passwordSuccess = this.passwordError = '';

    this.settingsService.changePassword(this.passwordForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.savingPassword  = false;
          this.passwordSuccess = 'Password changed successfully!';
          this.passwordForm.reset();
          setTimeout(() => this.passwordSuccess = '', 3000);
        },
        error: (err: any) => {
          this.savingPassword = false;
          this.passwordError  = err.error?.message ?? 'Failed to change password.';
        }
      });
  }

  private passwordsMatch(g: FormGroup): { mismatch: true } | null {
    const pw  = g.get('newPassword')?.value;
    const cpw = g.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw ? { mismatch: true } : null;
  }

  get initials(): string {
    const name = this.profileForm?.get('fullName')?.value ?? '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  }
}