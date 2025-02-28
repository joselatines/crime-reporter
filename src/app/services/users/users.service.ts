import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../../../lib/types/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly API_URL = `https://crime-reporter-api.onrender.com/api/v1/users`;

  constructor(private http: HttpClient) { }

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Create new user
  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.API_URL, user, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Update user
  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, {
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || 'Unknown error';
    return throwError(() => new Error(errorMessage));
  }
}
