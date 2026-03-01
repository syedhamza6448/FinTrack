import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { SharedModule } from '../../shared/shared.module';
import { ReportsComponent } from './reports.component';

const routes: Routes = [{ path: '', component: ReportsComponent }];

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    BaseChartDirective
  ]
})
export class ReportsModule {}