import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth/auth.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '../lib/types/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FormsModule,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'crime-reporter';

  constructor(private authService: AuthService) { }

  

/*   ngOnInit(): void {
    // Recupera la información del usuario si existe un token
    if (this.authService.isAuthenticated()) {
      this.authService.fetchUserInfo();
    }


    // Suscríbete al observable de userInfo para cambios en tiempo real
    this.userInfo$ = this.authService.getUserInfo();
  }

  logout(): void {
    this.authService.logout(); // Llama al método logout
  } */
}
