import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';

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
    this.httpClient.get("http://localhost:3000/scrapeNews")
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.data = response; // Asignamos si es un array válido.
          } else {
            this.error = "El servidor no retornó un array válido.";
            console.error("Respuesta no válida:", response);
          }
        },
        error: (err) => {
          this.error = "Hubo un error al obtener las noticias.";
          console.error("Error en la solicitud:", err);
        },
      });
  }
}
