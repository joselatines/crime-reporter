import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  roles = ['admin', 'detective']; // Actualización de los roles disponibles

  constructor(private fb: FormBuilder, private authServices: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]],
    });
  }

/*   (nexts) => {
    console.log('Usuario registrado exitosamente:', nexts);
    // Mostrar mensaje de éxito
    alert('¡Usuario registrado con éxito!');
  },
  (error) => {
    console.error('Error al registrar usuario:', error);
    // Mostrar mensaje de error
    alert('Ocurrió un error al registrar el usuario.')
 */
  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Register Data:', this.registerForm.value);
      this.authServices.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          // Aquí puedes redirigir al usuario o guardar el token en localStorage
        },
        error: (err) => {
          console.error('Error al registrar usuario:', err);
          // Mostrar mensaje de error
          alert('Ocurrió un error al registrar el usuario.')
        },
      });
      // Aquí puedes llamar a un servicio para enviar los datos al backend
    } else {
      console.log('Form is invalid');
    }
  }
}

