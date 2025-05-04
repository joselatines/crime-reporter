import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, PopupComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;

  // Propiedades para el popup
  showPopup = false;
  popupMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    this.loginError = null; // Resetea el error antes de intentar iniciar sesión
    this.isLoading = true; // Muestra el loader mientras espera la respuesta

    if (this.loginForm.valid) {
      const credentials = this.loginForm.value; // Obtén los valores del formulario

      this.authService.login(credentials).subscribe({
        next: (response: { message: string }) => {
          this.isLoading = false; // Oculta el loader cuando la respuesta es exitosa
          this.popupMessage = response.message || '¡Inicio de sesión exitoso!'; // Mensaje de éxito
          this.showPopup = true; // Muestra el popup
        },
        error: (err: any) => {
          this.isLoading = false; // Oculta el loader si ocurre un error

          if (err?.error?.message) {
            // Si el backend envía un mensaje de error específico en el cuerpo de la respuesta
            this.popupMessage = err.error.message;
          } else if (err?.status === 500) {
            // Si el error es un 500 (Internal Server Error)
            this.popupMessage = 'Ocurrió un error interno en el servidor. Intenta nuevamente más tarde.';
          } else if (err?.message) {
            // Si hay un mensaje de error en el objeto 'err'
            this.popupMessage = err.message;
          } else {
            // Si no hay información específica del error
            this.popupMessage = 'No se pudo iniciar sesión. Verifica tus credenciales e intenta nuevamente.';
          }
          this.showPopup = true; // Mostrar el popup con el mensaje de error

        },
      });
    } else {
      this.isLoading = false; // Detener el loader si el formulario no es válido
    }
  }

  // Método para cerrar el popup
  closePopup(): void {
    this.showPopup = false;
  }
}



