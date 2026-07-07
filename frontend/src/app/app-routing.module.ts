import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { PatientIntakeFormComponent } from './components/patient-intake-form/patient-intake-form.component';
import { PatientRecordsComponent } from './components/patient-records/patient-records.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'patients', component: PatientRecordsComponent, canActivate: [AuthGuard] },
  { path: 'patient-intake', component: PatientIntakeFormComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
