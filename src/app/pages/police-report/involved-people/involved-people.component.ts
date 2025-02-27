import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-involved-people',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, FormsModule],
  templateUrl: './involved-people.component.html',
  styleUrl: './involved-people.component.css'
})
export class InvolvedPeopleComponent {
  @Input() parentForm!: FormGroup;
/*   @Input() people!: FormArray; */
  @Output() addPerson = new EventEmitter<void>();

  get involvedPeople(): FormArray {
    return this.parentForm.get('involvedPeople') as FormArray;
  }

  constructor(private fb: FormBuilder) {}

  get people(): FormArray {
    return this.parentForm.get('people') as FormArray;
  }

  // Método para agregar una persona
  onAddPerson(): void {
    this.involvedPeople.push(this.createPerson());
  }

  // Método para eliminar una persona
  removePerson(index: number): void {
    this.involvedPeople.removeAt(index);
  }

  // Método para crear un nuevo grupo de persona
  private createPerson(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      cedula: ['V-', Validators.required],
      role: ['testigo', Validators.required],
      edad: [0, [Validators.required, Validators.min(0)]],
    });
  }


}
