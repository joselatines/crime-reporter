import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PopupComponent } from '../../shared/popup/popup.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PopupComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  roles = ['Detective', 'Admin']; // Roles disponibles
  isLoading = false; // Estado de carga
  showPopup = false; // Control de visibilidad del pop-up
  popupMessage = ''; // Mensaje del pop-up

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]], // Campo de confirmación de contraseña
      role: ['', Validators.required],
    }, { validator: this.passwordMatchValidator }); // Validador personalizado
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true; // Activa el estado de carga
      const formData = this.registerForm.value;

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.handleRegistrationSuccess(response);
        },
        error: (err) => {
          this.handleRegistrationError(err);
        },
      });
    } else {
      this.showFormError();
    }
  }

  // Manejo de registro exitoso
  private handleRegistrationSuccess(response: any): void {
    this.isLoading = false; // Desactiva el estado de carga
    this.popupMessage = response.message || 'User registered successfully!'; // Mensaje de éxito
    this.showPopup = true; // Muestra el pop-up
    setTimeout(() => this.closePopup(), 3000); // Cierra el pop-up después de 3 segundos
    this.registerForm.reset(); // Limpia el formulario
  }

  // Manejo de errores de registro
  private handleRegistrationError(err: any): void {
    this.isLoading = false;
    this.popupMessage = err.error?.message || 'Register failed'; // Mensaje de error específico
    this.showPopup = true; // Muestra el pop-up
    setTimeout(() => this.closePopup(), 3000); // Cierra el pop-up después de 3 segundos
    console.error('Error during registration:', err); // Log del error
  }

  // Mostrar error si el formulario no es válido
  private showFormError(): void {
    this.popupMessage = 'Please fill out the form correctly.'; // Mensaje de error
    this.showPopup = true; // Muestra el pop-up
    setTimeout(() => this.closePopup(), 3000); // Cierra el pop-up después de 3 segundos
  }

  // Método para cerrar el pop-up
  closePopup(): void {
    this.showPopup = false;
  }
}