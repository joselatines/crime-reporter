import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Interview } from '../../../lib/types/interview';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private readonly API_URL = `https://crime-reporter-api.onrender.com/api/v1/interviews`;

  constructor(private http: HttpClient) { }


  getInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.API_URL, {
      withCredentials: true // ← Esto permite enviar cookies automáticamente
    }).pipe(
      catchError(this.handleAuthError)
    );
  }

  createInterview(
    declaracion: string,
    entrevistadoData?: {
      name: string;
      cedula: string;
      role: string;
      edad: number;
      profesion?: string;
      declaracion: string;
    }
  ): Observable<Interview> {

    const body = { declaracion, entrevistadoData }; // Datos que espera el backend

    return this.http.post<Interview>(this.API_URL, body,).pipe(
      catchError(this.handleAuthError)
    );
  }

  // Método para actualizar una entrevista
  updateInterview(id: string, data: any): Observable<Interview> {
    return this.http.put<Interview>(`${this.API_URL}/${id}`, data).pipe(
      catchError(this.handleAuthError)
    );
  }

  // Método para eliminar una entrevista
  deleteInterview(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleAuthError)
    );
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || 'Error desconocido';
    return throwError(() => new Error(errorMessage));
  }
}
