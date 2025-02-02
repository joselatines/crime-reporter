import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-involved-people',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, FormsModule],
  templateUrl: './involved-people.component.html',
  styleUrl: './involved-people.component.css'
})
export class InvolvedPeopleComponent {
  involvedPeople: any[] = [];
  @Input() people!: any[];
  @Output() addPerson = new EventEmitter<void>();

  onAddPerson() {
    this.addPerson.emit();
  }
}
