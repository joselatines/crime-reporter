import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../../lib/types/user';
import { environment } from '../../../../environments/environment';

// Material UI imports - agrupados
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Mantén MatSnackBar y MatSnackBarModule
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // Material UI
    MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule,
    MatCardModule, MatSnackBarModule, MatFormFieldModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  // Inyección de dependencias
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar); // MatSnackBar se mantiene porque se usa en otras notificaciones
  private fb = inject(FormBuilder);

  // API URL
  private apiUrl = environment.apiUrl + '/users';

  // Datos
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  displayedColumns: string[] = ['username', 'email', 'role', 'actions'];

  // Estado del formulario
  userForm: FormGroup;
  editMode: boolean = false;
  selectedUser: User | null = null;

  constructor() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['detective', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Cargar usuarios
  loadUsers(): void {
    this.http.get<{message: string, users: User[]}>(this.apiUrl)
      .subscribe({
        next: (response) => {
          if (response.users) {
            this.users = response.users;
          } else if (Array.isArray(response)) {
            this.users = response;
          } else {
            this.users = (response as any).data || [];
          }
          this.filteredUsers = [...this.users];
          console.log('Usuarios cargados:', this.users);
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.showNotification('Error al cargar usuarios', 'error');
        }
      });
  }

  // Filtrar usuarios
  applyFilter(): void {
    const searchTerm = this.searchTerm.trim().toLowerCase();
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
  }

  // Enviar formulario (crear o actualizar)
  onSubmit(): void {
    if (this.userForm.invalid) return;

    const userData = this.userForm.value;

    if (this.editMode && this.selectedUser) {
      // Actualizar usuario existente
      if (!userData.password) delete userData.password;

      this.http.put<{message: string, user: User}>(`${this.apiUrl}/${this.selectedUser._id}`, userData)
        .subscribe({
          next: (response) => {
            console.log('Usuario actualizado:', response);
            this.loadUsers();
            this.resetForm();
            this.showNotification('Usuario actualizado exitosamente', 'success');
          },
          error: (err) => {
            console.error('Error actualizando usuario:', err);
            this.showNotification('Error al actualizar usuario', 'error');
          }
        });
    } else {
      // Crear nuevo usuario
      this.http.post<{message: string, user: User}>(this.apiUrl, userData)
        .subscribe({
          next: (response) => {
            console.log('Usuario creado:', response);
            this.loadUsers();
            this.resetForm();
            this.showNotification('Usuario creado exitosamente', 'success');
          },
          error: (err) => {
            console.error('Error creando usuario:', err);
            this.showNotification('Error al crear usuario', 'error');
          }
        });
    }
  }

  // Editar usuario
  editUser(user: User): void {
    this.editMode = true;
    this.selectedUser = user;

    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role: user.role,
      password: '' // Limpiar campo de contraseña por seguridad
    });

    // Hacer la contraseña opcional en modo edición
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // Eliminar usuario
  deleteUser(user: User): void {
    if (confirm(`¿Está seguro que desea eliminar a ${user.username}?`)) {
      this.http.delete<{message: string, user: User}>(`${this.apiUrl}/${user._id}`)
        .subscribe({
          next: (response) => {
            console.log('Usuario eliminado:', response);
            this.loadUsers();
            // --- INICIO DE LA SECCIÓN MODIFICADA ---
            // Aquí se cambia la notificación a un alert() nativo del navegador
            alert(`Usuario ${user.username} eliminado exitosamente.`);
            // --- FIN DE LA SECCIÓN MODIFICADA ---
          },
          error: (err) => {
            console.error('Error eliminando usuario:', err);
            // Si quieres un alert para el error de eliminación, puedes ponerlo aquí también
            alert(`Error al eliminar usuario ${user.username}.`);
          }
        });
    }
  }

  // Mostrar notificación (esta función seguirá usando MatSnackBar para otras operaciones como crear/actualizar)
  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['bg-green-500', 'text-white'] : ['bg-red-500', 'text-white']
    });
  }

  // Resetear formulario
  resetForm(): void {
    this.userForm.reset({ role: 'detective' });
    this.editMode = false;
    this.selectedUser = null;

    // Restablecer validación de contraseña a requerida
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // Cancelar edición
  cancelEdit(): void {
    this.resetForm();
  }
}