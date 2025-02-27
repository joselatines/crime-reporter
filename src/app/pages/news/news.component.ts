import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel
import { Comment } from '../../../lib/types/comment';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], // Agrega DatePipe para formatear fechas
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'] // Corrección aquí (debe ser styleUrls en plural)
})
export class NewsComponent implements OnInit {
  httpClient = inject(HttpClient);
  data: any[] = [];
  error: string | null = null;
  isLoading: boolean = false;
  placeholders: number[] = [1, 2, 3, 4];
  

  // Fuentes de noticias
  newsSources = [
    { name: 'Últimas Noticias', value: 'ultimasNoticias', selected: false },
    { name: 'El Nacional', value: 'elNacional', selected: false },
    { name: 'NTN24', value: 'ntn24', selected: false }
  ];
  showCommentInput: number | null = null; // Índice de la noticia que muestra el input de comentario
  newComment: string = ''; // Nuevo comentario
  commentAuthor: string = 'Usuario'; // Autor del comentario (podría venir de un servicio de autenticación)
  apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.isLoading = true;
    this.fetchData();
  }

  // Método para obtener noticias sin filtro
  fetchData() {
    this.isLoading = true;
    this.httpClient.get(`${this.apiUrl}/news`)
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.data)) {
            this.isLoading = false;
            console.log(response.data.length)
            console.log("Respuesta del servidor:", response);
            this.data = response.data.map((noticia: any) => {
              return { ...noticia, comments: [] };
            });
            
            // Fetch comments for each news item
            this.data.forEach((noticia, index) => {
              this.fetchCommentsForNews(noticia._id, index);
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

  // Fetch comments for a specific news item
  fetchCommentsForNews(newsId: string, index: number): void {
    this.httpClient.get<{message: string, data: Comment[]}>(`${this.apiUrl}/comments/news/${newsId}`)
      .subscribe({
        next: (response) => {
          this.data[index].comments = response.data;
        },
        error: (err) => {
          console.error(`Error fetching comments for news ${newsId}:`, err);
        }
      });
  }

  // Método para agregar un comentario
  addComment(index: number): void {
    if (this.newComment.trim()) {
      const newsId = this.data[index]._id;
      
      const commentData = {
        newsId: newsId,
        author: this.commentAuthor,
        content: this.newComment
      };
      
      this.httpClient.post<{message: string, data: Comment}>(`${this.apiUrl}/comments`, commentData)
        .subscribe({
          next: (response) => {
            // Add the new comment to the news item's comments array
            this.data[index].comments.push(response.data);
            this.newComment = ''; // Limpiar el input después de agregar el comentario
            this.showCommentInput = null; // Ocultar el input después de agregar el comentario
          },
          error: (err) => {
            console.error('Error adding comment:', err);
            // You could add error handling here, like showing an error message to the user
          }
        });
    }
  }

  // Método para eliminar un comentario
  deleteComment(newsIndex: number, commentId: string): void {
    this.httpClient.delete<{message: string, data: Comment}>(`${this.apiUrl}/comments/${commentId}`)
      .subscribe({
        next: (response) => {
          // Remove the comment from the array
          this.data[newsIndex].comments = this.data[newsIndex].comments.filter(
            (comment: Comment) => comment._id !== commentId
          );
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          // Could add error handling here, like showing an error message
        }
      });
  }
}
