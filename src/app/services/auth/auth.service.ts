import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginData, RegisterData } from '../../../lib/types/auth';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `${environment.apiUrl}/auth`

  constructor(private http: HttpClient) { }

  register(data: RegisterData) {
    return this.http.post(`${this.API_URL}/register`, data).subscribe(res => {
      console.log(res)
    })
  }

  login(credentials: LoginData): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      catchError((error) => {
        console.error('Error in login service:', error);
        return throwError(() => new Error(error.error?.message || 'Login failed'));
      })
    );
  }

  logout() {
    return this.http.post(`${this.API_URL}/logout`, {});
  }
}
