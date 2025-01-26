import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { PopupComponent } from './shared/popup/popup.component';

// Importa los componentes standalone directamente
import { HeaderComponent } from './shared/header/header.component';

const routes: Routes = [
  { path: 'auth/login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    // No es necesario declarar aquí si es standalone
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    HeaderComponent, // Importa el componente standalone directamente
    MatDialogModule,
    PopupComponent,
  ],
  providers: [],
  bootstrap: [], // Elimina AppComponent de aquí si es standalone
})
export class AppModule {}
