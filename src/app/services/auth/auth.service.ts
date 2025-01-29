import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
/* import { environment } from '../../../environments/environment'; */
import { LoginData, RegisterData } from '../../../lib/types/auth';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../lib/types/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `https://crime-reporter-api.onrender.com/api/v1`
  /*   private API_URL = `${environment.apiUrl}/auth`; */
  TOKEN_KEY = 'token';
  private userInfo = new BehaviorSubject<User | null>(null); // Almacena el rol del usuario

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
      this.http.get<{ message: string; user: User }>(`${this.API_URL}/users/me`).subscribe({
        next: (response) => {
          console.log('Datos del usuario:', response.user);
          if (response.user) {
            this.userInfo.next(response.user); // Accede al rol dentro de 'response.user'
          } else {
            this.userInfo.next(null); // Si no hay rol, lo resetea
          } // Almacena el rol en el BehaviorSubject
        },
        error: (error) => {
          console.error('Error obteniendo información del usuario:', error);
          this.userInfo.next(null); // Resetea el rol en caso de error
        }
      });
    } else {
      this.userInfo.next(null);
    }
  }

  getUserInfo(): Observable<User | null> {
    return this.userInfo.asObservable();
  }


  // Método adicional para determinar si el usuario es administrador
  isAdmin(): boolean {
    const currentUser = this.userInfo.value;
    return currentUser ? currentUser.role === 'admin' : false;
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data).pipe(
      catchError((error) => {
        return throwError(() => error.error?.message || "Error desconocido");
      })
    );
  }

  login(credentials: LoginData): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, credentials, /* {
      withCredentials: true,
    } */).pipe(
      tap((response: any) => {
        this.saveToken(response.token); // Guarda el token recibido
        this.fetchUserInfo();
        /* this.userRole.next(response.role); */
        console.log(response)
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
    this.userInfo.next(null);
    this.router.navigateByUrl('/login');
  }
}
