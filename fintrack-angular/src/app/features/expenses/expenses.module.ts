import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ExpensesComponent } from './expenses.component';

const routes: Routes = [
  { path: '', component: ExpensesComponent }
];

@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ExpensesModule {}