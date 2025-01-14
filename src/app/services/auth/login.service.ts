import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root', // Hace que este servicio sea accesible globalmente
})
export class AuthService {
  private validCredentials = { email: 'user@example.com', password: 'password123' };

  constructor() {}

  login(credentials: { email: string; password: string }): Observable<any> {
    const { email, password } = credentials;

    if (email === this.validCredentials.email && password === this.validCredentials.password) {
      return of({ message: 'Login successful' });
    } else {
      return throwError(() => new Error('Invalid email or password'));
    }
  }
}
