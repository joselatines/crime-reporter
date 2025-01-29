import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
/* import { environment } from '../../../environments/environment'; */
import { LoginData, RegisterData } from '../../../lib/types/auth';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `https://crime-reporter-api.onrender.com/api/v1`
  /*   private API_URL = `${environment.apiUrl}/auth`; */
  TOKEN_KEY = 'token';
  private userRole = new BehaviorSubject<string | null>(null); // Almacena el rol del usuario

  constructor(private http: HttpClient, private router: Router) { }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();  // Comprueba si hay un token en el almacenamiento local
  }

  fetchUserInfo(): void {
    if (this.isAuthenticated()) {
      this.http.get<{ message: string; user: { role: string } }>(`${this.API_URL}/users/me`).subscribe({
        next: (response) => {
          console.log('Datos del usuario:', response.user.role);
          if (response.user && response.user.role) {
            this.userRole.next(response.user.role); // Accede al rol dentro de 'response.user'
          } else {
            this.userRole.next(null); // Si no hay rol, lo resetea
          } // Almacena el rol en el BehaviorSubject
        },
        error: (error) => {
          console.error('Error obteniendo información del usuario:', error);
          this.userRole.next(null); // Resetea el rol en caso de error
        }
      });
    } else {
      this.userRole.next(null);
    }
  }

  getUserRole(): Observable<string | null> {
    return this.userRole.asObservable();
  }

  // Método adicional para determinar si el usuario es administrador
  isAdmin(): boolean {
    return this.userRole.value === 'admin';
  }

  /*   isAdmin(): Observable<boolean> {
      return this.getUserInfo().pipe(
        tap((user) => {
          console.log('Datos del usuario:', user.user); // Agregar console.log aquí para ver los datos
        }),
        map((user) => user.user.role === 'admin'), // Devuelve true si el rol es 'admin'
        catchError((error) => {
          console.error('Error obteniendo información del usuario:', error);
          return of(false); // Retorna false si ocurre un error
        })
      );
    } */

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data).pipe(
      catchError((error) => {
        return throwError(() => error.error?.message || "Error desconocido");
      })
    );
  }

  login(credentials: LoginData): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, credentials/* , {
      withCredentials: true, // Para enviar cookies (Deshabilitado para probar en local)
    } */).pipe(
      tap((response: any) => {
        this.saveToken(response.token); // Guarda el token recibido
        this.userRole.next(response.role);
        console.log(response.role)
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
    this.userRole.next(null);
    this.router.navigateByUrl('/login');
  }
}
