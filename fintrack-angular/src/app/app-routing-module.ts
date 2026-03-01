import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // ── Landing page (public) ──────────────────────────────────
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule)
  },

  // ── Auth pages (public) ────────────────────────────────────
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // ── App shell (protected) ──────────────────────────────────
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/shell/shell.module').then(m => m.ShellModule)
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}