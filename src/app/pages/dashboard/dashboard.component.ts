import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    userInfo: any | null = null; // Almacena la información del usuario
    userInfoSubscription!: Subscription;
  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.userInfoSubscription = this.authService.getUserInfo().subscribe((info) => {
      this.userInfo = info; // Actualiza la información del usuario
      console.log('Información del usuario actual:', this.userInfo);
    });
  }
}
