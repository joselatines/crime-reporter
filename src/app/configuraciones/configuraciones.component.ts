import { Component } from '@angular/core';

@Component({
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.css']
})
export class ConfiguracionesComponent {
  config = {
    email: '',
    palabras: ''
  };

  onSubmit() {
    console.log('Configuraciones guardadas:', this.config);
  }
}
