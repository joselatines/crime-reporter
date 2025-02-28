import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../environments/environment';
import { User } from '../../lib/types/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ConfiguracionesComponent implements OnInit {
  currentUser: User | null = null;
  apiUrl = environment.apiUrl;
  config = {
    email: '',
    palabras: ''
  };
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.loadUserSettings();
    } else {
      console.log('No user logged in');
      this.errorMessage = 'Debe iniciar sesión para ver y guardar configuraciones';
    }
  }

  loadUserSettings(): void {
    this.isLoading = true;
    console.log(`Loading settings for user: ${this.currentUser?._id}`);
    
    this.httpClient.get(`${this.apiUrl}/users/${this.currentUser?._id}`)
      .subscribe({
        next: (response: any) => {
          console.log('User settings retrieved:', response);
          this.isLoading = false;
          
          if (response.user) {
            this.config.email = response.user.notificationEmail || '';
            this.config.palabras = response.user.newsWantedWords ? 
              response.user.newsWantedWords.join(', ') : '';
            
            console.log('Settings loaded:', this.config);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar configuraciones';
          console.error('Error loading user settings:', err);
        }
      });
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.errorMessage = 'Debe iniciar sesión para guardar configuraciones';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const newsWantedWords = this.config.palabras
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    const notificationData = {
      userId: this.currentUser._id,
      newsWantedWords: newsWantedWords,
      notificationEmail: this.config.email
    };

    console.log('Sending notification settings:', notificationData);
    
    this.httpClient.put(`${this.apiUrl}/settings/notifications`, notificationData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Configuraciones guardadas exitosamente';
          console.log('Settings updated successfully:', response);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Error al guardar configuraciones';
          console.error('Error updating settings:', err);
        }
      });
  }
}
