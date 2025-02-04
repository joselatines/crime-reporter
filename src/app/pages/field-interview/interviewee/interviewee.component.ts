import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-interviewee',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './interviewee.component.html',
  styleUrl: './interviewee.component.css'
})
export class IntervieweeComponent{
  @Input() formGroup!: FormGroup;
  
  estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo'];
}
