import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../../lib/types/user';
import { AuthService } from '../../../services/auth/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IntervieweeComponent } from "../interviewee/interviewee.component";
import { InterviewDevelopmentComponent } from '../interview-development/interview-development.component';
import { InterviewService } from '../../../services/interview.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-field-interview-form',
  standalone: true,
  imports: [IntervieweeComponent, IntervieweeComponent, InterviewDevelopmentComponent],
  templateUrl: './field-interview-form.component.html',
  styleUrl: './field-interview-form.component.css'
})
export class FieldInterviewFormComponent implements OnInit {
  intervieweeForm: FormGroup;
  interviewDevelopmentForm: FormGroup;
  currentUser: User | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private interviewService: InterviewService, private router:Router) {
    // Grupo para el interviewee
    this.intervieweeForm = this.fb.group({
      nombre: ['', Validators.required],
      cedula: ['V-', [ // Valor inicial con V-
        Validators.required,
      ]],
      edad: ['', Validators.required],
      profesion: ['', Validators.required],
    });

    // Grupo para el interviewDevelopment
    this.interviewDevelopmentForm = this.fb.group({
      declaracion: ['', Validators.required]
    });

  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.intervieweeForm.invalid || this.interviewDevelopmentForm.invalid) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    const entrevistadoData = {
      name: this.intervieweeForm.value.nombre,
      cedula: this.intervieweeForm.value.cedula,
      role: 'testigo', // Ajusta según tu lógica
      edad: this.intervieweeForm.value.edad,
      profesion: this.intervieweeForm.value.profesion,
      declaracion: this.interviewDevelopmentForm.value.declaracion // Campo requerido del modelo
    };

    this.interviewService.createInterview(
      this.interviewDevelopmentForm.value.declaracion,
      entrevistadoData
    ).subscribe({
      next: (res) => {
        alert('Entrevista guardada exitosamente');
        this.router.navigate(["/entrevista_de_campo"])
        this.resetForms();
      },
      error: (err) => {
        console.error('Error:', err.message);
        alert(err.message);
      }
    });

  }

  resetForms() {
    this.intervieweeForm.reset();
    this.interviewDevelopmentForm.reset();
  }

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.currentUser = this.authService.currentUserValue;
  }

  generatePDF() {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    // Genera un número entero aleatorio entre 1000 y 9999
    const numeroExpediente = Math.floor(Math.random() * 100);


    // ========== ENCABEZADO INSTITUCIONAL ==========
    try {
      const logo = new Image();
      logo.src = 'logo/cicpc-logo.jpg';
      doc.addImage(logo, 'JPG', margin, yPos, 30, 30);
    } catch (error) {
      console.error('Error cargando el logo:', error);
    }

    // Texto institucional
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const headerText = [
      "REPÚBLICA BOLIVARIANA DE VENEZUELA",
      "MINISTERIO DEL PODER POPULAR PARA RELACIONES INTERIORES, JUSTICIA Y PAZ",
      "CUERPO DE INVESTIGACIONES CIENTÍFICAS, PENALES Y CRIMINALÍSTICAS (CICPC)"
    ];

    headerText.forEach((line, index) => {
      doc.text(line, margin + 35, yPos + 10 + (index * 5));
    });

    // Datos de la entrevista
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const fecha = new Date().toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    doc.text(`Fecha: ${fecha} | Expediente: ${numeroExpediente}`,
      margin, yPos + 40);

    // Línea divisoria
    yPos += 50;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // ========== DATOS DEL FUNCIONARIO ==========
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("FUNCIONARIO ACTUANTE", margin, yPos);

    // Tabla con datos del funcionario
    if (this.currentUser) {
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Nombre', 'Cédula', 'Rango', 'N° Placa']],
        body: [[
          this.currentUser.username || 'N/A',
          this.currentUser._id || 'N/A',
          this.currentUser._id || 'N/A',
          this.currentUser._id || 'N/A'
        ]],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 }
      });
    }

    const lastTable = (doc as any).lastAutoTable;
    if (lastTable && lastTable.finalY) {
      yPos = lastTable.finalY + 10;
    } else {
      yPos += 20; // Valor predeterminado si no hay tabla
    }

    // ========== DATOS DEL ENTREVISTADO ==========
    doc.setFontSize(12);
    doc.text("DATOS DEL ENTREVISTADO", margin, yPos);
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Nombre', 'Cédula', 'Edad', 'Profesión']],
      body: [[
        this.intervieweeForm.value.nombre || 'N/A',
        this.intervieweeForm.value.cedula || 'N/A',
        this.intervieweeForm.value.edad || 'N/A',
        this.intervieweeForm.value.profesion || 'N/A'
      ]],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 }
    });

    // Obtener la posición Y después de la tabla
    const lastTable2 = (doc as any).lastAutoTable;
    if (lastTable2 && lastTable2.finalY) {
      yPos = lastTable2.finalY + 10;
    } else {
      yPos += 20; // Valor predeterminado si no hay tabla
    }

    // ========== DESARROLLO DE LA ENTREVISTA ==========
    doc.setFontSize(12);
    doc.text("DESARROLLO DE LA ENTREVISTA", margin, yPos);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const declaracion = this.interviewDevelopmentForm.value.declaracion || 'No se registraron declaraciones';
    const splitText = doc.splitTextToSize(declaracion, pageWidth - margin * 2);

    doc.text(splitText, margin, yPos + 10);

    // ========== FIRMAS Y SELLOS ==========
    const sello = new Image();
    sello.src = 'logo/cicpc-logo.jpg';
    doc.addImage(sello, 'PNG', margin, doc.internal.pageSize.getHeight() - 50, 40, 40);

    // Firma del funcionario
    doc.setFontSize(10);
    doc.text("FUNCIONARIO RESPONSABLE", pageWidth - 70, doc.internal.pageSize.getHeight() - 40);
    doc.text("_________________________", pageWidth - 70, doc.internal.pageSize.getHeight() - 35);
    doc.text(this.intervieweeForm.value.nombre || '', pageWidth - 70, doc.internal.pageSize.getHeight() - 30);
    doc.text(`Placa: ${this.intervieweeForm.value.numeroPlaca || ''}`,
      pageWidth - 70, doc.internal.pageSize.getHeight() - 25);

    doc.save(`ACTA_ENTREVISTA${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
