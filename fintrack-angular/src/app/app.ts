import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { updateFaviconForTheme } from './core/utils/favicon';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const theme = this.authService.userTheme;
    document.documentElement.setAttribute('data-theme', theme);
    updateFaviconForTheme();
  }
}