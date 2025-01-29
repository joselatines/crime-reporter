import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
/* import { MatDialogModule } from '@angular/material/dialog'; */
import { PopupComponent } from './shared/popup/popup.component';


import { HeaderComponent } from './shared/header/header.component';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './interceptor/auth.interceptor';


@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HeaderComponent,
/*     MatDialogModule, */
    PopupComponent,
    FormsModule,
    AppComponent
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
