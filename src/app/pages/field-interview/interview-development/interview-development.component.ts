import { Component, Input} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-interview-development',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './interview-development.component.html',
  styleUrl: './interview-development.component.css'
})
export class InterviewDevelopmentComponent{
  @Input() formGroup!: FormGroup;

}
