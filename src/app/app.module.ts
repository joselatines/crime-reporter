import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { PopupComponent } from './shared/popup/popup.component';
import { ConfiguracionesComponent } from './configuraciones/configuraciones.component';

import { HeaderComponent } from './shared/header/header.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: 'auth/login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'configuraciones', component: ConfiguracionesComponent }
];

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    HeaderComponent,
    MatDialogModule,
    PopupComponent,
    FormsModule,
    AppComponent
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
