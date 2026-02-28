import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AbsPipe } from './pipes/abs.pipe';

@NgModule({
  declarations: [AbsPipe],
  imports: [CommonModule, RouterModule],
  exports: [
    CommonModule,   // *ngIf, *ngFor, [ngClass], async pipe
    RouterModule,   // routerLink, routerLinkActive
    AbsPipe         // | abs
  ]
})
export class SharedModule {}