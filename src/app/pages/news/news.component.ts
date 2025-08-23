import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../lib/types/comment';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../../lib/types/user';
import { timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Es una buena práctica crear un servicio para las peticiones HTTP, pero
// para este ejemplo, las integramos directamente en el componente.
// En una aplicación más grande, se recomendaría un 'ScrapingService'.

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, OnDestroy {
  // Inyección de dependencias
  httpClient = inject(HttpClient);
  authService = inject(AuthService);

  // Propiedades del componente
  currentUser: User | null = null;
  data: any[] = [];
  error: string | null = null;
  isLoading: boolean = false;
  isUpdating: boolean = false;
  placeholders: number[] = [1, 2, 3, 4];

  newsSources = [
    { name: 'Últimas Noticias', value: 'ultimasnoticias.com.ve', selected: false },
    { name: 'El Nacional', value: 'elnacional.com', selected: false },
    { name: 'NTN24', value: 'ntn24.com', selected: false }
  ];
  showCommentInput: number | null = null;
  newComment: string = '';
  commentAuthor: string = 'Usuario';
  apiUrl = environment.apiUrl;

  // Propiedad para gestionar la suscripción al poller y evitar fugas de memoria
  private statusSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.isLoading = true;
    this.currentUser = this.authService.currentUserValue;

    console.log('NewsComponent initialized. Current user:', this.currentUser ? this.currentUser.username : 'Not logged in');

    if (this.currentUser?._id) {
      console.log(`Fetching settings for user: ${this.currentUser.username} (${this.currentUser._id})`);
      this.httpClient.get(`${this.apiUrl}/users/${this.currentUser._id}`)
        .subscribe({
          next: (response: any) => {
            console.log('User settings retrieved:', response);
            if (response.user?.settings?.sourceWebsitesToScrape) {
              console.log('Found saved news sources:', response.user.settings.sourceWebsitesToScrape);
              this.newsSources.forEach(source => {
                source.selected = response.user.settings.sourceWebsitesToScrape.includes(source.value);
              });
              this.fetchNewsBasedOnSelection();
            } else {
              console.log('No saved news sources found, using defaults');
              this.fetchNewsBasedOnSelection();
            }
          },
          error: (err) => {
            console.error('Error fetching user settings:', err);
            this.fetchNewsBasedOnSelection();
          }
        });
    } else {
      console.log('No user logged in, using default news sources');
      this.fetchNewsBasedOnSelection();
    }

    // Inicia el poller para consultar el estado del scraping en el backend cada 5 segundos
    this.statusSubscription = timer(0, 5000)
      .pipe(
        switchMap(() => this.httpClient.get<{ isRunning: boolean }>(`${this.apiUrl}/status`))
      )
      .subscribe({
        next: (response) => {
          this.isUpdating = response.isRunning;
        },
        error: (err) => {
          console.error('Error fetching scraping status:', err);
          this.isUpdating = false;
        }
      });
  }

  ngOnDestroy(): void {
    // Es crucial desuscribirse para evitar fugas de memoria cuando el componente se destruye
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

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

  fetchNewsBasedOnSelection(): void {
    const selectedSources = this.newsSources
      .filter(source => source.selected)
      .map(source => source.value);

    this.fetchData(selectedSources);
  }

  fetchData(selectedSources: string[] = []): void {
    this.isLoading = true;
    let url = `${this.apiUrl}/news`;

    if (selectedSources.length > 0) {
      const sourcesParam = selectedSources.join(',');
      url = `${this.apiUrl}/news?sources=${sourcesParam}`;
      console.log(`Fetching news from URL: ${url}`);
    }

    this.httpClient.get(url)
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response.data)) {
            this.isLoading = false;
            console.log(`Received ${response.data.length} news items`);
            this.data = response.data.map((noticia: any) => {
              return { ...noticia, comments: [] };
            });
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
  }

  updateNews(): void {
    const selectedSources = this.newsSources
      .filter(source => source.selected)
      .map(source => source.value);

    // Llama al endpoint del backend para iniciar el proceso de scraping
    this.httpClient.get(`${this.apiUrl}/`)
      .subscribe({
        next: (response: any) => {
          console.log('Scraping iniciado en el backend:', response.message);
          // No se necesita actualizar isUpdating aquí, el poller de ngOnInit lo hará automáticamente
          this.isLoading = true;
        },
        error: (err) => {
          console.error('Error al iniciar el scraping:', err);
          // Si hay un error, el poller se encargará de resetear el estado isUpdating
          this.isLoading = false;
        }
      });

    // Guardar las preferencias del usuario si está autenticado
    if (this.currentUser?._id) {
      console.log(`Saving news source preferences for user: ${this.currentUser.username}`);
      const updateData = {
        settings: {
          sourceWebsitesToScrape: selectedSources
        }
      };

      this.httpClient.put(`${this.apiUrl}/users/${this.currentUser._id}`, updateData)
        .subscribe({
          next: (response) => {
            console.log('User preferences saved successfully:', response);
          },
          error: (err) => {
            console.error('Error updating user settings:', err);
          }
        });
    }
  }

  toggleCommentInput(index: number): void {
    if (this.showCommentInput === index) {
      this.showCommentInput = null;
    } else {
      this.showCommentInput = index;
    }
    this.newComment = '';
  }

  fetchCommentsForNews(newsId: string, index: number): void {
    this.httpClient.get<{ message: string, data: Comment[] }>(`${this.apiUrl}/comments/news/${newsId}`)
      .subscribe({
        next: (response) => {
          this.data[index].comments = response.data;
        },
        error: (err) => {
          console.error(`Error fetching comments for news ${newsId}:`, err);
        }
      });
  }

  addComment(index: number): void {
    if (this.newComment.trim()) {
      const newsId = this.data[index]._id;

      const commentData = {
        newsId: newsId,
        author: this.commentAuthor,
        content: this.newComment
      };

      this.httpClient.post<{ message: string, data: Comment }>(`${this.apiUrl}/comments`, commentData)
        .subscribe({
          next: (response) => {
            this.data[index].comments.push(response.data);
            this.newComment = '';
            this.showCommentInput = null;
          },
          error: (err) => {
            console.error('Error adding comment:', err);
          }
        });
    }
  }

  deleteComment(newsIndex: number, commentId: string): void {
    this.httpClient.delete<{ message: string, data: Comment }>(`${this.apiUrl}/comments/${commentId}`)
      .subscribe({
        next: (response) => {
          this.data[newsIndex].comments = this.data[newsIndex].comments.filter(
            (comment: Comment) => comment._id !== commentId
          );
        },
        error: (err) => {
          console.error('Error deleting comment:', err);
        }
      });
  }
}
