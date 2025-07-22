import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule], // Añade CommonModule aquí
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  // Propiedad para controlar el estado del menú desplegable
  isDropdownOpen = false;

  // Inyecta AuthService para la autenticación y ElementRef para detectar clics
  constructor(
    public authService: AuthService, 
    private el: ElementRef
  ) {}

  // Este listener detecta clics en cualquier parte del documento
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    // Si el clic fue FUERA del componente del header, cierra el menú
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  // Alterna la visibilidad del menú (abrir/cerrar)
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Cierra el menú explícitamente
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // Llama al servicio de logout y también cierra el menú
  logoutAndClose(): void {
    this.authService.logout();
    this.closeDropdown();
  }
}