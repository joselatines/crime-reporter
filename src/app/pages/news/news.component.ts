import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

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
  isLoading: boolean = false;
  placeholders: number[] = [1, 2, 3, 4];

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchData()
  };

  fetchData() {
    this.isLoading = true;
    const API_URL = environment.apiUrl
/*     const API_URL = "http://localhost:3000" */
    console.log({API_URL})
    this.httpClient.get(`${API_URL}/news`)
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta del servidor:', response);
          if (Array.isArray(response)) {
            console.log('Noticias recibidas:', response); 
            this.isLoading = false;
            this.data = response; // Asignamos si es un array válido.
            console.log(this.data)
          } else {
            this.error = "El servidor no retornó un array válido.";
            console.error("Respuesta no válida:", response);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.error = "Hubo un error al obtener las noticias.";
          console.error("Error en la solicitud:", err);
        },
      });
  }
}

/* 
  Funciona
fetchData() {
  this.isLoading = true;
  const API_URL = environment.apiUrl
  console.log({API_URL})
  this.httpClient.get(`${API_URL}/news` ||"http://localhost:5000/api/v1/news")
    .subscribe({
      next: (response: any) => {
        if (Array.isArray(response.data)) {
          this.isLoading = false;
          this.data = response.data; // Asignamos si es un array válido.
        } else {
          this.error = "El servidor no retornó un array válido.";
          console.error("Respuesta no válida:", response);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = "Hubo un error al obtener las noticias.";
        console.error("Error en la solicitud:", err);
      },
    });
} */