import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvolvedPeopleComponent } from '../involved-people/involved-people.component';
import { EvidenceListComponent } from '../evidence-list/evidence-list.component';
import { IncidentFormComponent } from '../incident-form/incident-form.component';
import { PoliceReportService } from '../../../services/police-report/police-report.service';
import { InvolvedPerson } from '../../../../lib/types/InvolvedPerson';
import { Router } from '@angular/router';

@Component({
  selector: 'app-police-report-form',
  standalone: true,
  imports: [ReactiveFormsModule, InvolvedPeopleComponent, EvidenceListComponent, IncidentFormComponent],
  templateUrl: './police-report-form.component.html',
  styleUrl: './police-report-form.component.css'
})
export class PoliceReportFormComponent {
  /*   incidentForm: FormGroup = new FormGroup({});
    incidentForm: FormGroup = new FormGroup({}); */
  incidentForm: FormGroup;
  /*   involvedPeopleForm: FormGroup;
    involvedPeople: InvolvedPerson[] = []; */

  constructor(private fb: FormBuilder, private policeReportService: PoliceReportService, private router: Router) {
    // Inicializar formularios con campos vacíos
    this.incidentForm = this.fb.group({
      location: ['', Validators.required],
      description: ['', Validators.required],
      time: ['', Validators.required],
      securityMeasures: [''],
      observations: [''],
      attachments: [''],
      involvedPeople: this.fb.array([]), // FormArray para personas
      evidenceItems: this.fb.array([]) // FormArray para evidencias
    });
    /*     this.incidentForm = this.fb.group({
          location: ['', Validators.required],
          description: ['', Validators.required],
          time: ['', Validators.required],
          securityMeasures: [''],
          observations: [''],
          attachments: ['']
        }); */

    // Inicializar evidenceForm
    /*     this.evidenceForm = this.fb.group({
          items: this.fb.array([])
        }); */

    // Inicializar involvedPeopleForm
    /*     this.involvedPeopleForm = this.fb.group({
          people: this.fb.array([this.createPerson()])
        }); */
  }

  /*   get items(): FormArray {
      return this.evidenceForm.get('items') as FormArray;
    } */

  // Getter para el FormArray de personas involucradas
  /*   get people(): FormArray {
      return this.involvedPeopleForm.get('people') as FormArray;
    } */

  // Getter para personas involucradas
  get involvedPeople(): FormArray {
    return this.incidentForm.get('involvedPeople') as FormArray;
  }

  // Getter para evidencias
  get evidenceItems(): FormArray {
    return this.incidentForm.get('evidenceItems') as FormArray;
  }

  // Método para agregar una evidencia
  addEvidence() {
    this.evidenceItems.push(this.fb.control('', Validators.required));
    /* this.items.push(this.fb.control('', Validators.required)); */
  }

  // Método para crear un nuevo grupo de persona
  createPerson(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      cedula: ['V-', Validators.required],
      role: ['testigo', Validators.required],
      edad: [0, [Validators.required, Validators.min(0)]]
    });
  }

  removeEvidence(index: number) {
    this.evidenceItems.removeAt(index);
  }

  // Método para agregar una persona
  addPerson() {
    this.involvedPeople.push(this.createPerson());
  }
  /*   addPerson() {
      this.people.push(
        this.fb.group({
          name: ['', Validators.required],
          cedula: ['V-', Validators.required],
          role: ['testigo', Validators.required],
          edad: [0, [Validators.required, Validators.min(0)]],
        }));
    } */

  onSubmit(): void {
    if (!this.incidentForm.valid) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    /* 
        const reportData = {
          ...this.incidentForm.value,
          evidenceItems: this.items.value,
          involvedPeople: this.people.value,
        }; */

    // Agregar log para ver datos enviados
    console.log('Datos enviados:', this.incidentForm.value);

    this.policeReportService.createInterview(this.incidentForm.value).subscribe({
      next: (report: any) => {
        console.log('Reporte creado exitosamente:', report);
        this.router.navigate(["/reporte"])
        this.resetForms()
      },
      error: (err) => {
        console.error('Error al crear el reporte:', err);
      }
    })
  }

  resetForms() {
    this.incidentForm.reset();
    /*     this.evidenceForm.reset();
        this.involvedPeople = []; */
  }
}
