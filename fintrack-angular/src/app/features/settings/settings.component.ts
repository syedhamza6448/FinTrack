import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { updateFaviconForTheme } from '../../core/utils/favicon';
import { extractError } from '../../shared/utils/error.util';

function passwordsMatch(g: AbstractControl): ValidationErrors | null {
  const pw = g.get('newPassword')?.value;
  const cpw = g.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab = 'profile';
  savingProfile = false;
  savingPrefs = false;
  savingPassword = false;
  profileSuccess = '';
  profileError = '';
  prefsSuccess = '';
  prefsError = '';
  passwordSuccess = '';
  passwordError = '';
  showCurrentPw = false;
  showNewPw = false;
  showConfirmPw = false;

  profileForm!: FormGroup;
  prefsForm!: FormGroup;
  passwordForm!: FormGroup;

  readonly currencies = [
    { code: 'NGN', label: 'Nigerian Naira (₦)' },
    { code: 'USD', label: 'US Dollar ($)' },
    { code: 'EUR', label: 'Euro (€)' },
    { code: 'GBP', label: 'British Pound (£)' },
    { code: 'GHS', label: 'Ghanaian Cedi (₵)' },
    { code: 'KES', label: 'Kenyan Shilling (KSh)' },
    { code: 'ZAR', label: 'South African Rand (R)' },
    { code: 'CAD', label: 'Canadian Dollar (CA$)' }
  ];
  get currencyOptions() { return this.currencies.map(c => ({ value: c.code, label: c.label })); }

  get initials(): string {
    const fn = this.profileForm?.get('firstName')?.value ?? '';
    const ln = this.profileForm?.get('lastName')?.value ?? '';
    return (fn[0] ?? '').toUpperCase() + (ln[0] ?? '').toUpperCase() || 'U';
  }

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUser;

    this.profileForm = this.fb.group({
      firstName: [user?.fullName?.split(' ')[0] ?? '', Validators.required],
      lastName: [user?.fullName?.split(' ').slice(1).join(' ') ?? '', Validators.required],
      occupation: [''],
      dateOfBirth: ['']
    });

    this.prefsForm = this.fb.group({
      currency: [user?.currency ?? 'NGN'],
      theme: [user?.theme ?? 'dark']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });

    // Load latest from API
    this.settingsService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: s => {
          this.profileForm.patchValue({
            firstName: s.firstName ?? '',
            lastName: s.lastName ?? '',
            occupation: s.occupation ?? '',
            dateOfBirth: s.dateOfBirth ? s.dateOfBirth.substring(0, 10) : ''
          });
          this.prefsForm.patchValue({
            currency: s.currency ?? 'NGN',
            theme: s.theme ?? 'dark'
          });
          this.applyTheme(s.theme ?? 'dark');
        },
        error: () => { }
      });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  setTab(tab: string): void {
    this.activeTab = tab;
    this.profileSuccess = this.profileError = this.prefsSuccess = this.prefsError = this.passwordSuccess = this.passwordError = '';
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true;
    this.profileSuccess = this.profileError = '';

    const v = this.profileForm.value;
    this.settingsService.updateProfile({
      firstName: v.firstName,
      lastName: v.lastName,
      occupation: v.occupation || undefined,
      dateOfBirth: v.dateOfBirth || undefined
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.savingProfile = false;
        this.profileSuccess = 'Profile updated successfully!';
        this.authService.updateCurrentUser({
          fullName: `${v.firstName} ${v.lastName}`.trim()
        } as any);
        setTimeout(() => this.profileSuccess = '', 3000);
      },
      error: (err: any) => {
        this.savingProfile = false;
        this.profileError = extractError(err);
      }
    });
  }

  onSavePrefs(): void {
    if (this.prefsForm.invalid) { this.prefsForm.markAllAsTouched(); return; }
    this.savingPrefs = true;
    this.prefsSuccess = this.prefsError = '';

    const v = this.prefsForm.value;
    this.settingsService.updatePreferences({ currency: v.currency, theme: v.theme })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.savingPrefs = false;
          this.prefsSuccess = 'Preferences saved!';
          this.applyTheme(v.theme);
          this.authService.updateCurrentUser({ currency: v.currency, theme: v.theme } as any);
          setTimeout(() => this.prefsSuccess = '', 3000);
        },
        error: (err: any) => {
          this.savingPrefs = false;
          this.prefsError = extractError(err);
        }
      });
  }

  onThemeChange(theme: string): void {
    this.prefsForm.get('theme')!.setValue(theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    updateFaviconForTheme();
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.savingPassword = true;
    this.passwordSuccess = this.passwordError = '';

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.settingsService.changePassword({ currentPassword, newPassword })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.savingPassword = false;
          this.passwordSuccess = 'Password changed successfully!';
          this.passwordForm.reset();
          setTimeout(() => this.passwordSuccess = '', 3000);
        },
        error: (err: any) => {
          this.savingPassword = false;
          this.passwordError = extractError(err);
        }
      });
  }
}