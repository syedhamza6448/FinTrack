import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DebtComponent } from './debt.component';

const routes: Routes = [{ path: '', component: DebtComponent }];

@NgModule({
  declarations: [DebtComponent],
  imports: [SharedModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class DebtModule {}