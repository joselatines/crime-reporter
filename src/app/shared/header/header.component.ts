import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  userInfo: any | null = null; // Almacena la información del usuario
  userInfoSubscription!: Subscription;
  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.userInfoSubscription = this.authService.getUserInfo().subscribe((info) => {
      this.userInfo = info; // Actualiza la información del usuario
      console.log('Información del usuario actual:', this.userInfo);
    });
  }

  ngOnDestroy(): void {
    if (this.userInfoSubscription) {
      this.userInfoSubscription.unsubscribe(); // Limpia la suscripción
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
