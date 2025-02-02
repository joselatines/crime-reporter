import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Para simular peticiones HTTP
import { NewsComponent } from './news.component';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para ngModel

describe('NewsComponent', () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsComponent, HttpClientTestingModule, FormsModule] // Agrega HttpClientTestingModule y FormsModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isLoading as true', () => {
    expect(component.isLoading).toBeTrue();
  });

  it('should initialize with empty data and placeholders', () => {
    expect(component.data).toEqual([]);
    expect(component.placeholders).toEqual([1, 2, 3, 4]);
  });

  it('should toggle comment input visibility', () => {
    // Simula que no hay ningún input visible inicialmente
    expect(component.showCommentInput).toBeNull();

    // Llama al método para mostrar el input en la primera noticia (índice 0)
    component.toggleCommentInput(0);
    expect(component.showCommentInput).toBe(0);

    // Llama al método nuevamente para ocultar el input
    component.toggleCommentInput(0);
    expect(component.showCommentInput).toBeNull();
  });

  it('should add a comment to a news item', () => {
    // Simula una noticia en el array de datos
    component.data = [
      {
        imgUrl: 'https://example.com/image.jpg',
        title: 'Noticia de prueba',
        description: 'Descripción de prueba',
        link: 'https://example.com',
        comments: [] // Inicializa el array de comentarios vacío
      }
    ];

    // Simula que el input de comentario está visible para la primera noticia (índice 0)
    component.showCommentInput = 0;
    component.newComment = 'Este es un comentario de prueba';

    // Llama al método para agregar el comentario
    component.addComment(0);

    // Verifica que el comentario se haya agregado correctamente
    expect(component.data[0].comments).toEqual(['Este es un comentario de prueba']);
    expect(component.newComment).toBe(''); // Verifica que el input se haya limpiado
    expect(component.showCommentInput).toBeNull(); // Verifica que el input se haya ocultado
  });

  it('should not add an empty comment', () => {
    // Simula una noticia en el array de datos
    component.data = [
      {
        imgUrl: 'https://example.com/image.jpg',
        title: 'Noticia de prueba',
        description: 'Descripción de prueba',
        link: 'https://example.com',
        comments: [] // Inicializa el array de comentarios vacío
      }
    ];

    // Simula que el input de comentario está visible para la primera noticia (índice 0)
    component.showCommentInput = 0;
    component.newComment = ''; // Comentario vacío

    // Llama al método para agregar el comentario
    component.addComment(0);

    // Verifica que no se haya agregado ningún comentario
    expect(component.data[0].comments).toEqual([]);
  });

  it('should handle fetchData error', () => {
    // Simula un error en la solicitud HTTP
    spyOn(component.httpClient, 'get').and.throwError('Error de prueba');
    component.fetchData();

    // Verifica que isLoading sea false y que se haya establecido un mensaje de error
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBe('Hubo un error al obtener las noticias.');
  });
});