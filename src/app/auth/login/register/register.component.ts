import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/auth/login.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]  // Importar módulos necesarios
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private loginServices: LoginService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Formulario válido', this.registerForm.value);
      this.loginServices.login(this.registerForm.value);
    } else {
      console.log('Formulario no válido');
      this.loginServices.login(this.registerForm.value);
    }
  }
}