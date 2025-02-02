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
}
