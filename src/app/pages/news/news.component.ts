import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel
import { Comment } from '../../../lib/types/comment';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../../lib/types/user';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], // Agrega DatePipe para formatear fechas
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css'] // Corrección aquí (debe ser styleUrls en plural)
})
export class NewsComponent implements OnInit {
  httpClient = inject(HttpClient);
  authService = inject(AuthService);
  currentUser: User | null = null;
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
    this.currentUser = this.authService.currentUserValue;
    
    console.log('NewsComponent initialized. Current user:', this.currentUser ? this.currentUser.username : 'Not logged in');
    
    if (this.currentUser?._id) {
      console.log(`Fetching settings for user: ${this.currentUser.username} (${this.currentUser._id})`);
      
        
      // Fetch user settings from API
      this.httpClient.get(`${this.apiUrl}/users/${this.currentUser._id}`)
        .subscribe({
          next: (response: any) => {
            console.log('User settings retrieved:', response);
            if (response.user?.settings?.sourceWebsitesToScrape) {
              console.log('Found saved news sources:', response.user.settings.sourceWebsitesToScrape);
              if (response.user.settings.sourceWebsitesToScrape) {
                this.newsSources.forEach(source => {
                  source.selected = response.user.settings.sourceWebsitesToScrape.includes(source.value);
                })
              }
              this.updateNewsSourcesSelection(response.user.settings.sourceWebsitesToScrape);
            } else {
              console.log('No saved news sources found, using defaults');
            }
            this.fetchData();
          },
          error: (err) => {
            console.error('Error fetching user settings:', err);
            console.log('Falling back to default news sources');
            this.fetchData(); // Still fetch news with default settings
          }
        });
    } else {
      console.log('No user logged in, using default news sources');
      this.fetchData(); // No user logged in, fetch with default settings
    }
  }
  
  // Update news sources checkboxes based on user settings
  updateNewsSourcesSelection(sources: string[]): void {
    console.log('Updating news source selection with:', sources);
    this.newsSources.forEach(source => {
      const wasSelected = source.selected;
      source.selected = sources.includes(source.value);
      if (wasSelected !== source.selected) {
        console.log(`Source "${source.name}" is now ${source.selected ? 'selected' : 'unselected'}`);
      }
    });
    console.log('Updated news sources:', this.newsSources.map(s => ({ name: s.name, selected: s.selected })));
  }

  // Método para obtener noticias sin filtro
  fetchData() {
    this.isLoading = true;
    this.httpClient.get(`${this.apiUrl}/news`)
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.data)) {
            this.isLoading = false;
            console.log(`Received ${response.data.length} news items`);
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
    
    console.log('Updating news with selected sources:', selectedSources);

    // If user is logged in, save preferences
    if (this.currentUser?._id) {
      console.log(`Saving news source preferences for user: ${this.currentUser.username}`);
      const updateData = {
        settings: {
          sourceWebsitesToScrape: selectedSources
        }
      };
      
      console.log('Sending update to server:', updateData);
      this.httpClient.put(`${this.apiUrl}/users/${this.currentUser._id}`, updateData)
        .subscribe({
          next: (response) => {
            console.log('User preferences saved successfully:', response);
            // After saving preferences, fetch the news
            this.fetchData();
          },
          error: (err) => {
            console.error('Error updating user settings:', err);
            console.log('Proceeding to fetch news despite settings save failure');
            // Still try to fetch news even if saving preferences failed
            this.fetchData();
          }
        });
    } else {
      console.log('No user logged in, fetching news without saving preferences');
      // No user logged in, just fetch the news
      this.fetchData();
    }
  }
  
  // Fetch news with selected sources
  fetchNewsWithSources(selectedSources: string[]) {
    return
    if (selectedSources.length > 0) {
      const sourcesParam = selectedSources.join(',');
      console.log(`Fetching news with sources: ${sourcesParam}`);
      
      this.httpClient.get(`${this.apiUrl}/news?sources=${sourcesParam}`)
        .subscribe({
          next: (response: any) => {
            if (Array.isArray(response.data)) {
              this.isLoading = false;
              console.log(`Received ${response.data.length} filtered news items`);
              this.data = response.data.map((noticia: any) => {
                return { ...noticia, comments: [] };
              });
              
              console.log('Fetching comments for filtered news items');
              // Fetch comments for each news item
              this.data.forEach((noticia, index) => {
                this.fetchCommentsForNews(noticia._id, index);
              });
            } else {
              this.error = "El servidor no retornó un array válido.";
              console.error("Respuesta no válida:", response);
              this.isLoading = false;
            }
          },
          error: (err: any) => {
            this.isLoading = false;
            this.error = "Hubo un error al obtener las noticias.";
            console.error("Error en la solicitud:", err);
          },
        });
    } else {
      console.log('No sources selected, clearing news data');
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
    } else {
      console.log('Comment submission canceled: empty comment');
    }
  }

  // Método para eliminar un comentario
  deleteComment(newsIndex: number, commentId: string): void {
    this.httpClient.delete<{message: string, data: Comment}>(`${this.apiUrl}/comments/${commentId}`)
      .subscribe({
        next: (response) => {
          // Remove the comment from the array
          const previousCount = this.data[newsIndex].comments.length;
          this.data[newsIndex].comments = this.data[newsIndex].comments.filter(
            (comment: Comment) => comment._id !== commentId
          );
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
          console.error('Server response:', err.error);
          // Could add error handling here, like showing an error message
        }
      });
  }
}
