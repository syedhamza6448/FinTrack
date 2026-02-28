import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { InvestmentsComponent } from './investments.component';

const routes: Routes = [{ path: '', component: InvestmentsComponent }];

@NgModule({
  declarations: [InvestmentsComponent],
  imports: [SharedModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class InvestmentsModule {}