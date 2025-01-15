import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginData, RegisterData } from '../../../lib/types/auth';

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

  login(credentials: LoginData) {
    return this.http.post(`${this.API_URL}/login`, credentials).subscribe(res => {
      console.log(res)
    });
  }

  logout() {
    return this.http.post(`${this.API_URL}/logout`, {});
  }
}
