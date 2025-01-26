import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  @Input() message: string = ''; // Mensaje a mostrar en el popup
  @Input() show: boolean = false; // Control de visibilidad del popup
  @Output() closePopup = new EventEmitter<void>(); // Emite el evento para cerrar el popup

  constructor() {}

  // Método para cerrar el popup
  onClose(): void {
    this.closePopup.emit();
  }
}
