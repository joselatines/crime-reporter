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
  constructor(public authService: AuthService) { }

}
