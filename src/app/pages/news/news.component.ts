import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'] // Corrección aquí (debe ser styleUrls en plural)
})
export class NewsComponent implements OnInit {
  httpClient = inject(HttpClient);
  data: any[] = [];
  error: string | null = null;
  isLoading: boolean = false;
  placeholders: number[] = [1, 2, 3, 4];
  
  // Variables para comentarios
  showCommentInput: number | null = null;
  newComment: string = '';

  // Fuentes de noticias
  newsSources = [
    { name: 'Últimas Noticias', value: 'ultimas-noticias', selected: false },
    { name: 'El Nacional', value: 'el-nacional', selected: false },
    { name: 'NTN24', value: 'ntn24', selected: false }
  ];

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchData();
  }

  // Método para obtener noticias sin filtro
  fetchData() {
    this.isLoading = true;
    const API_URL = "https://crime-reporter-api.onrender.com/api/v1";
    this.httpClient.get(`${API_URL}/news`)
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.data)) {
            this.isLoading = false;
            this.data = response.data.map((noticia: any) => {
              return { ...noticia, comments: [] };
            });
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

  // Método para actualizar las noticias según las fuentes seleccionadas
  updateNews() {
    this.isLoading = true;
    const selectedSources = this.newsSources
      .filter(source => source.selected)
      .map(source => source.value);

    if (selectedSources.length > 0) {
      const API_URL = "https://crime-reporter-api.onrender.com/api/v1";
      this.httpClient.get(`${API_URL}/news?sources=${selectedSources.join(',')}`)
        .subscribe({
          next: (response: any) => {
            if (Array.isArray(response.data)) {
              this.isLoading = false;
              this.data = response.data.map((noticia: any) => {
                return { ...noticia, comments: [] };
              });
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
    } else {
      this.data = [];
      this.isLoading = false;
    }
  }

  // Método para mostrar/ocultar el input de comentario
  toggleCommentInput(index: number): void {
    if (this.showCommentInput === index) {
      this.showCommentInput = null;
    } else {
      this.showCommentInput = index;
    }
    this.newComment = ''; // Limpiar el input al cambiar de noticia
  }

  // Método para agregar un comentario
  addComment(index: number): void {
    if (this.newComment.trim()) {
      this.data[index].comments.push(this.newComment);
      this.newComment = ''; // Limpiar el input después de agregar el comentario
      this.showCommentInput = null; // Ocultar el input después de agregar el comentario
    }
  }
}
