import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

/* type News = {
  title: string;
  description: string;
  link: string;
} */

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit {

  httpClient = inject(HttpClient)
  data: any[] = [];
  error: string | null = null;

  ngOnInit(): void {
    this.fetchData()
  };

  fetchData() {
    const API_URL = environment.apiUrl
    console.log({API_URL})
    this.httpClient.get(`${API_URL}/news` ||"http://localhost:5000/api/v1/news")
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.data)) {
            this.data = response.data; // Asignamos si es un array válido.
          } else {
            this.error = "El servidor no retornó un array válido.";
            console.error("Respuesta no válida:", response);
          }
        },
        error: (err: any) => {
          this.error = "Hubo un error al obtener las noticias.";
          console.error("Error en la solicitud:", err);
        },
      });
  }
}
