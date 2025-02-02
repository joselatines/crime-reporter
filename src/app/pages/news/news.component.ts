import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule], // Agrega FormsModule aquí
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit {

  httpClient = inject(HttpClient)
  data: any[] = [];
  error: string | null = null;
  isLoading: boolean = false;
  placeholders: number[] = [1, 2, 3, 4];
  showCommentInput: number | null = null; // Índice de la noticia que muestra el input de comentario
  newComment: string = ''; // Nuevo comentario

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchData()
  };

  fetchData() {
    this.isLoading = true;
    const API_URL = "https://crime-reporter-api.onrender.com/api/v1";
    this.httpClient.get(`${API_URL}/news` || "https://crime-reporter-api.onrender.com/api/v1/news")
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.data)) {
            this.isLoading = false;
            this.data = response.data.map((noticia: any) => {
              return { ...noticia, comments: [] }; // Inicializa el array de comentarios para cada noticia
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