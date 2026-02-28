import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { BudgetComponent } from './budget.component';

const routes: Routes = [{ path: '', component: BudgetComponent }];

@NgModule({
  declarations: [BudgetComponent],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class BudgetModule {}