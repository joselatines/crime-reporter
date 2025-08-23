import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NewsComponent } from './news.component';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

describe('NewsComponent', () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsComponent, HttpClientTestingModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no hayan solicitudes HTTP pendientes
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.isLoading).toBeTrue();
    expect(component.isUpdating).toBeFalse();
    expect(component.data).toEqual([]);
    expect(component.placeholders).toEqual([1, 2, 3, 4]);
    expect(component.showCommentInput).toBeNull();
  });

  describe('toggleCommentInput', () => {
    it('should toggle comment input visibility', () => {
      expect(component.showCommentInput).toBeNull();

      component.toggleCommentInput(0);
      expect(component.showCommentInput).toBe(0);

      component.toggleCommentInput(0);
      expect(component.showCommentInput).toBeNull();
    });

    it('should clear newComment when toggling', () => {
      component.newComment = 'Test comment';
      component.toggleCommentInput(0);
      expect(component.newComment).toBe('');
    });
  });

  describe('addComment', () => {
    beforeEach(() => {
      component.data = [{
        _id: '1',
        imgUrl: 'https://example.com/image.jpg',
        title: 'Test News',
        description: 'Test Description',
        comments: []
      } as any];
      component.showCommentInput = 0;
    });

    it('should not add an empty comment', () => {
      component.newComment = '';
      component.addComment(0);
      expect(component.data[0].comments.length).toBe(0);
    });

    it('should make HTTP POST request when adding a valid comment', () => {
      component.newComment = 'Test comment';
      component.addComment(0);

      const req = httpMock.expectOne(`${environment.apiUrl}/comments`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Success', data: { _id: '1', content: 'Test comment', author: 'Usuario' } });

      expect(component.data[0].comments.length).toBe(1);
      expect(component.newComment).toBe('');
      expect(component.showCommentInput).toBeNull();
    });
  });

  describe('updateNews', () => {
    it('should set isUpdating and isLoading to true when called', fakeAsync(() => {
      component.updateNews();
      expect(component.isUpdating).toBeTrue();
      expect(component.isLoading).toBeTrue();

      // Simula el paso del tiempo para el finally
      tick();
    }));

    // CORRECCIÓN: Se prueba el efecto (la alerta) en lugar del método privado
    it('should call window.alert if already updating', () => {
      component.isUpdating = true;
      spyOn(window, 'alert'); 
      
      component.updateNews();
      
      expect(window.alert).toHaveBeenCalledWith('Estamos actualizando las noticias para ti. Por favor, espera un momento...');
    });

    it('should make HTTP requests for logged in user', fakeAsync(() => {
      component.currentUser = { _id: '123', username: 'testuser' } as any;
      component.newsSources[0].selected = true;
      
      component.updateNews();
      tick();

      const userReq = httpMock.expectOne(`${environment.apiUrl}/users/123`);
      expect(userReq.request.method).toBe('PUT');
      userReq.flush({});

      const newsReq = httpMock.expectOne(`${environment.apiUrl}/news?sources=ultimasnoticias.com.ve`);
      expect(newsReq.request.method).toBe('GET');
      newsReq.flush({ data: [] });
    }));

    it('should handle errors during update', fakeAsync(() => {
      spyOn(console, 'error');
      component.updateNews();
      tick();

      httpMock.expectOne(`${environment.apiUrl}/news`).error(new ProgressEvent('error'));
      
      expect(component.isLoading).toBeFalse();
      expect(component.isUpdating).toBeFalse();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('fetchData', () => {
    it('should fetch news without sources when none selected', () => {
      component.fetchData();
      
      const req = httpMock.expectOne(`${environment.apiUrl}/news`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });

      expect(component.isLoading).toBeFalse();
      expect(component.isUpdating).toBeFalse();
    });

    it('should fetch news with selected sources', () => {
      component.fetchData(['source1', 'source2']);
      
      const req = httpMock.expectOne(`${environment.apiUrl}/news?sources=source1,source2`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });

      expect(component.isLoading).toBeFalse();
      expect(component.isUpdating).toBeFalse();
    });

    it('should handle fetch error', () => {
      spyOn(console, 'error');
      component.fetchData();

      httpMock.expectOne(`${environment.apiUrl}/news`).error(new ProgressEvent('error'));
      
      expect(component.isLoading).toBeFalse();
      expect(component.error).toBe('Hubo un error al obtener las noticias.');
      expect(console.error).toHaveBeenCalled();
    });
  });

  // CORRECCIÓN: El método privado no se puede probar directamente. 
  // La prueba ya se cubrió en 'updateNews' al espiar window.alert. 
  // Este bloque se podría eliminar, pero si quieres mantenerlo, 
  // así es como se haría de forma indirecta:
  describe('showUpdateAlert', () => {
    it('should show an alert when called by another method', () => {
      spyOn(window, 'alert');
      // No puedes llamar a component.showUpdateAlert()
      // En su lugar, debes llamar a un método público que lo use.
      // Por ejemplo, si el código tiene un método público que llama al privado:
      // component.somePublicMethodThatCallsThePrivateOne();
      // O, como en tu caso, simulas la condición para que `updateNews` lo invoque.
      component.isUpdating = true;
      component.updateNews();
      expect(window.alert).toHaveBeenCalledWith('Estamos actualizando las noticias para ti. Por favor, espera un momento...');
    });
  });

  describe('deleteComment', () => {
    it('should make DELETE request and remove comment', () => {
      component.data = [{
        _id: '1',
        comments: [{ _id: 'comment1' } as any, { _id: 'comment2' } as any]
      } as any];

      component.deleteComment(0, 'comment1');
      
      const req = httpMock.expectOne(`${environment.apiUrl}/comments/comment1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(component.data[0].comments.length).toBe(1);
      expect(component.data[0].comments[0]._id).toBe('comment2');
    });
  });
});