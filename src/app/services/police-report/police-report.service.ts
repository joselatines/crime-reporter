import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { InvolvedPerson } from '../../../lib/types/InvolvedPerson';
import { policeReport } from '../../../lib/types/policeReport';


@Injectable({
  providedIn: 'root'
})
export class PoliceReportService {
  private readonly API_URL = `https://crime-reporter-api.onrender.com/api/v1/report`;

  constructor(private http: HttpClient) { }

  getPoliceReport(): Observable<InvolvedPerson[]> {
    return this.http.get<InvolvedPerson[]>(this.API_URL, {
      withCredentials: true // ← Esto permite enviar cookies automáticamente
    }).pipe(
      catchError(this.handleAuthError)
    )
  }

  createInterview(report: policeReport){
    return this.http.post<policeReport>(this.API_URL, report, {
      withCredentials: true 
    }).pipe(
      catchError(this.handleAuthError)
    )
  }

  editInterview(id: string, report: policeReport){
    return this.http.put<policeReport>(`${this.API_URL}/${id}`, report, {
      withCredentials: true 
    }).pipe(
      catchError(this.handleAuthError)
    )
  }

  deleteReport(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`, {
      withCredentials: true
    }).pipe(
      catchError(this.handleAuthError)
    );
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || 'Error desconocido';
    return throwError(() => new Error(errorMessage));
  }
}
