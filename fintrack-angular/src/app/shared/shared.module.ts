import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule],
  exports: [
    CommonModule,   // Re-exported: gives *ngIf, *ngFor, [ngClass] to any module that imports SharedModule
    RouterModule    // Re-exported: gives routerLink, routerLinkActive to any module that imports SharedModule
  ]
})
export class SharedModule {}