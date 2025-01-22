import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginData, RegisterData } from '../../../lib/types/auth';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
/*   private API_URL = `https://crime-reporter-api.onrender.com/api/v1/auth`  */
  TOKEN_KEY = 'token';
  private API_URL = `${environment.apiUrl}/auth` 

  constructor(private http: HttpClient) { }

  saveToken(token: string): void {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data)
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


  login(credentials: LoginData): Observable<any> {
    debugger;
    return this.http.post(`${this.API_URL}/login`, credentials)
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
    return this.http.post(`${this.API_URL}/logout`, {});
  }


}
