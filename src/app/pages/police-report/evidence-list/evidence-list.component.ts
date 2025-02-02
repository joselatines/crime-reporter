import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-evidence-list',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './evidence-list.component.html',
  styleUrl: './evidence-list.component.css'
})
export class EvidenceListComponent {
  @Input() evidenceItems!: FormArray<FormControl>;
  @Output() addEvidence = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {}

  createItem(): FormControl {
    return this.fb.control('');
  }

  onAddEvidence() {
    this.addEvidence.emit();
  }
}
