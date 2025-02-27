import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
/* import { environment } from '../../../environments/environment'; */
import { LoginData, LoginResponse, RegisterData } from '../../../lib/types/auth';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../lib/types/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `https://crime-reporter-api.onrender.com/api/v1`;
  /*   private API_URL = `${environment.apiUrl}/auth`; */
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'currentUser'
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem(this.USER_KEY);
    let user: User | null = null;
    // Verifica que storedUser no sea `undefined` antes de parsear
    if (storedUser !== null && storedUser !== 'undefined') {
      try {
        user = JSON.parse(storedUser);
      } catch (error) {
        console.error('Error al parsear el usuario del localStorage:', error);
      }
    }

    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();

  }

  saveToken(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }


  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();  // Comprueba si hay un token en el almacenamiento local
  }

  private resetAuthState(): void {
    this.currentUserSubject.next(null);
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || 'Error desconocido';
    return throwError(() => new Error(errorMessage));
  }


  // Método adicional para determinar si el usuario es administrador
  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data).pipe(
      catchError(this.handleAuthError)
    );
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, credentials, {
      withCredentials: true // ← Envía cookies automáticamente
    }).pipe(
      tap((response) => {
        console.log('Respuesta del servidor en login:', response)
        this.saveToken(response.token, response);
        if (response.token) {
          this.currentUserSubject.next(response);
        }
        this.router.navigateByUrl('/dashboard');
      }),
      catchError((error) => {
        console.error('Error en el login:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }
  /*   login(credentials: LoginData): Observable<any> {
      return this.http.post(`${this.API_URL}/auth/login`, credentials).pipe(
        tap((response: any) => {
          this.saveToken(response.token); // Guarda el token recibido
          this.userRole.next(response.role);
          this.router.navigateByUrl('/dashboard');
          console.log("response", response)
          this.currentUserSubject.next(response.user);
        }),
        catchError((error) => {
          console.error('Error en el login:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
    } */

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.resetAuthState();
    this.router.navigateByUrl('/login');
  }
  /*   logout() {
      localStorage.removeItem(this.TOKEN_KEY);
      this.userRole.next(null);
      this.router.navigateByUrl('/login');
    } */
}
