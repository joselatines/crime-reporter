import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ConfiguracionesComponent } from './configuraciones.component';
import { AuthService } from '../services/auth/auth.service';
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('ConfiguracionesComponent', () => {
  let component: ConfiguracionesComponent;
  let fixture: ComponentFixture<ConfiguracionesComponent>;
  let authServiceMock: any;
  let httpClientMock: any;

  beforeEach(async () => {
    // Create mock for AuthService
    authServiceMock = {
      currentUserValue: {
        _id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'detective'
      }
    };

    // Create mock for HttpClient
    httpClientMock = {
      get: jasmine.createSpy('get').and.returnValue(of({
        user: {
          notificationEmail: 'test@example.com',
          newsWantedWords: ['crime', 'robbery']
        }
      })),
      put: jasmine.createSpy('put').and.returnValue(of({ success: true }))
    };

    await TestBed.configureTestingModule({
      imports: [
        ConfiguracionesComponent,
        FormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: HttpClient, useValue: httpClientMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user settings on init', () => {
    expect(httpClientMock.get).toHaveBeenCalled();
    expect(component.config.email).toBe('test@example.com');
    expect(component.config.palabras).toBe('crime, robbery');
  });

  it('should update notification settings on form submit', () => {
    // Set form values
    component.config.email = 'new@example.com';
    component.config.palabras = 'murder, theft';
    
    // Submit form
    component.onSubmit();
    
    // Verify API call
    expect(httpClientMock.put).toHaveBeenCalledWith(
      jasmine.any(String),
      {
        userId: 'test-user-id',
        newsWantedWords: ['murder', 'theft'],
        notificationEmail: 'new@example.com'
      }
    );
  });

  it('should handle error when updating settings', () => {
    // Mock error response
    httpClientMock.put.and.returnValue(throwError(() => new Error('Server error')));
    
    // Submit form
    component.onSubmit();
    
    // Verify error handling
    expect(component.errorMessage).toBeTruthy();
    expect(component.successMessage).toBe('');
  });

  it('should not submit if user is not logged in', () => {
    // Set user to null
    component.currentUser = null;
    
    // Submit form
    component.onSubmit();
    
    // Verify API was not called
    expect(httpClientMock.put).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
  });
});
