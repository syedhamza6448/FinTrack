import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { EducationComponent } from './education.component';

const routes: Routes = [{ path: '', component: EducationComponent }];

@NgModule({
  declarations: [EducationComponent],
  imports: [SharedModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class EducationModule {}