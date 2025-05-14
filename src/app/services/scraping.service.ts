import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrapingService {
  private apiUrl = 'https://crime-reporter-api.onrender.com/api/v1/scrapings';

  constructor(private http: HttpClient) { }

  getScrapings(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

}
