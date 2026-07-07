import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { HeaderComponent } from './components/header/header.component';
import { PatientIntakeFormComponent } from './components/patient-intake-form/patient-intake-form.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PatientRecordsComponent } from './components/patient-records/patient-records.component';
import { ToastComponent } from './components/toast/toast.component';
import { LoginComponent } from './components/login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    HeaderComponent,
    PatientIntakeFormComponent,
    SidebarComponent,
    PatientRecordsComponent,
    ToastComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
