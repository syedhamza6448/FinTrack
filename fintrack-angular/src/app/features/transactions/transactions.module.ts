import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { TransactionsComponent } from './transactions.component';

const routes: Routes = [
  { path: '', component: TransactionsComponent }
];

@NgModule({
  declarations: [TransactionsComponent],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class TransactionsModule {}