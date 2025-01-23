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
  /*   private API_URL = `https://crime-reporter-api.onrender.com/api/v1/auth`  */
  private API_URL = `${environment.apiUrl}/auth`;
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
    )
  }

  /*   register(data: RegisterData) {
      this.http.post(`${this.API_URL}/register`, data).subscribe({
        
        next: (res) => {
          console.log('Registro exitoso:', res);
        },
        error: (err) => {
          console.error('Error en el registro:', err);
        }
      });
    } */

  /*   login(credentials: LoginData): Observable<any> {
      return this.http.post(`${this.API_URL}/login`, credentials).pipe(
        catchError((error) => {
          console.error('Error in login service:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
    } */


  login(credentials: LoginData) {
    this.http.post(`${this.API_URL}/login`, credentials, {
      withCredentials: true, // Para enviar cookies
    }).subscribe(
      (response: any) => {
        this.saveToken(response.token);
        this.router.navigateByUrl('/dashboard');
        /*         localStorage.setItem('token', response.token);
                console.log('JWT recibido:', response.token); */

      })

    /* next: (response) => {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      console.log('JWT recibido:', response.token); // Verifica el token recibido
    },
    error: (err) => {
      console.error('Error en el registro:', err);
    }
  }); */
  }

  /*   login(credentials: LoginData): Observable<any> {
      return this.http.post(`${this.API_URL}/login`, credentials).pipe(
        tap((res) => {
          console.log('Inicio de sesión exitoso:', res); // Respuesta del backend
        }),
        catchError((error) => {
          console.error('Error en el login:', error); // Error del backend
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
    } */


  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigateByUrl('/login');
  }


}
