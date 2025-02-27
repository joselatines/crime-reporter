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
  @Input() evidenceItems!: FormArray;
  @Output() addEvidence = new EventEmitter<void>();
/*   @Input() evidenceItems!: FormArray<FormControl>;
  @Output() addEvidence = new EventEmitter<void>(); */

/*   constructor(private fb: FormBuilder) {}

  createItem(): FormControl {
    return this.fb.control('');
  }
 */

  getFormControl(index: number): FormControl {
    return this.evidenceItems.at(index) as FormControl;
  }

  onAddEvidence() {
    this.addEvidence.emit();
  }

  removePerson(index: number): void {
    this.evidenceItems.removeAt(index);
  }
}
