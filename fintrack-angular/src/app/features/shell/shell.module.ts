import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ShellComponent } from './shell.component';
import { Component } from '@angular/core';

// Temporary placeholder — replaced in Phase 3
@Component({
  selector: 'app-dashboard-placeholder',
  standalone: false,
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1 style="font-family: var(--font-display); font-size: 32px; color: var(--accent); margin-bottom: 12px;">
        🎉 You're in!
      </h1>
      <p style="color: var(--text-secondary); font-size: 16px;">
        Dashboard coming in Phase 3. Auth is working perfectly.
      </p>
    </div>
  `
})
export class DashboardPlaceholderComponent {}

const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'dashboard', component: DashboardPlaceholderComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  declarations: [ShellComponent, DashboardPlaceholderComponent],
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class ShellModule {}