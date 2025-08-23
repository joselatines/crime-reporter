import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../lib/types/comment';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../../lib/types/user';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  httpClient = inject(HttpClient);
  authService = inject(AuthService);
  currentUser: User | null = null;
  data: any[] = [];
  error: string | null = null;
  isLoading: boolean = false;
  isUpdating: boolean = false; // Nueva propiedad para controlar el estado de actualización
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
              if (response.user.settings.sourceWebsitesToScrape) {
                this.newsSources.forEach(source => {
                  source.selected = response.user.settings.sourceWebsitesToScrape.includes(source.value);
                })
              }
              this.updateNewsSourcesSelection(response.user.settings.sourceWebsitesToScrape);
            } else {
              console.log('No saved news sources found, using defaults');
            }
            this.fetchNewsBasedOnSelection();
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
    let url = `${this.apiUrl}/news`

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
            this.isUpdating = false; // Resetear el estado de actualización
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
            this.isUpdating = false;
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.isUpdating = false;
          this.error = "Hubo un error al obtener las noticias.";
          console.error("Error en la solicitud:", err);
        },
      });
  }

  // Método actualizado para manejar la actualización de noticias
  async updateNews(): Promise<void> {
    if (this.isUpdating) {
      this.showUpdateAlert();
      return;
    }

    this.isUpdating = true;
    this.isLoading = true;
    
    const selectedSources = this.newsSources
      .filter(source => source.selected)
      .map(source => source.value);

    console.log('Updating news with selected sources:', selectedSources);

    try {
      if (this.currentUser?._id) {
        console.log(`Saving news source preferences for user: ${this.currentUser.username}`);
        const updateData = {
          settings: {
            sourceWebsitesToScrape: selectedSources
          }
        };

        await this.httpClient.put(`${this.apiUrl}/users/${this.currentUser._id}`, updateData)
          .toPromise()
          .then((response) => {
            console.log('User preferences saved successfully:', response);
          })
          .catch((err) => {
            console.error('Error updating user settings:', err);
          });
      }

      await this.fetchDataAsync(selectedSources);
    } catch (error) {
      console.error('Error updating news:', error);
      this.isLoading = false;
      this.isUpdating = false;
    }
  }

  private async fetchDataAsync(selectedSources: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fetchData(selectedSources);
      // Asumimos que fetchData manejará el estado de isLoading/isUpdating
      resolve();
    });
  }

  private showUpdateAlert(): void {
    alert('Estamos actualizando las noticias para ti. Por favor, espera un momento...');
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