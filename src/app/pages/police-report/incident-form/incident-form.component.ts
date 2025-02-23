import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './incident-form.component.html',
  styleUrl: './incident-form.component.css'
})
export class IncidentFormComponent {
  @Input() formGroup!: FormGroup;
  
}
