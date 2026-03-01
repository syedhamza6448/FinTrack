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
  get currencyOptions() { return this.currencies.map(c => ({ value: c.code, label: c.label })); }
  timezoneOptions = [
    { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
    { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
    { value: 'Africa/Accra', label: 'Africa/Accra (GMT)' },
    { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' }
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
          const fullName = s.fullName ?? s.name ?? [s.firstName, s.lastName].filter(Boolean).join(' ') ?? '';
          this.profileForm.patchValue({
            fullName: fullName,
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

    const fullName = (this.profileForm.get('fullName')?.value ?? '').trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const profilePayload = {
      firstName: parts[0] ?? '',
      lastName:  (parts.slice(1).join(' ') || parts[0]) ?? '',
      occupation: undefined as string | undefined,
      dateOfBirth: undefined as string | undefined
    };

    const prefsPayload = {
      currency: this.profileForm.get('currency')?.value ?? 'NGN',
      theme: this.authService.userTheme
    };

    this.settingsService.updateProfile(profilePayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.settingsService.updatePreferences(prefsPayload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.savingProfile  = false;
                this.profileSuccess = 'Profile updated successfully!';
                this.authService.updateCurrentUser({
                  fullName,
                  email: this.profileForm.get('email')?.value,
                  currency: prefsPayload.currency,
                  theme: prefsPayload.theme
                } as any);
                setTimeout(() => this.profileSuccess = '', 3000);
              },
              error: (err: any) => {
                this.savingProfile = false;
                this.profileError  = err.error?.message ?? 'Failed to update preferences.';
              }
            });
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

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.settingsService.changePassword({ currentPassword, newPassword })
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