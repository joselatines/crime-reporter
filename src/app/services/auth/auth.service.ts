import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginData, RegisterData } from '../../../lib/types/auth';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `https://crime-reporter-api.onrender.com/api/v1/auth`
  /*   private API_URL = `${environment.apiUrl}/auth`; */
  TOKEN_KEY = 'token';

  constructor(private http: HttpClient, private router: Router) { }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data).pipe(
      catchError((error) => {
        return throwError(() => error.error?.message || "Error desconocido");
      })
    );
  }

  login(credentials: LoginData): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials, {
      withCredentials: true, // Para enviar cookies
    }).pipe(
      tap((response: any) => {
        this.saveToken(response.token); // Guarda el token recibido
        this.router.navigateByUrl('/dashboard');
      }),
      catchError((error) => {
        console.error('Error en el login:', error); // Muestra el error
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigateByUrl('/login');
  }
}
