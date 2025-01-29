import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FormsModule,],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'crime-reporter';
  isAdminUser: boolean = false;
  isAuthenticatedUser: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Obtén el estado de autenticación
    this.isAuthenticatedUser = this.authService.isAuthenticated();

    // Actualiza el rol del usuario
    this.authService.fetchUserInfo();

    // Suscríbete al rol del usuario
    this.authService.getUserRole().subscribe((role) => {
      this.isAdminUser = role === 'admin';
      console.log('Es administrador:', this.isAdminUser);
    });
  }
}
