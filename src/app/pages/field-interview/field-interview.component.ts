import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { User } from '../../../lib/types/user';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { InterviewService } from '../../services/interview/interview.service';
import { TruncatePipePipe } from '../../shared/pipe/truncate-pipe.pipe';

interface FieldInterview {
  _id: string;
  declaracion: string;
  entrevistado: {
    _id: string;
    name: string;
    cedula: string;
    role: string;
    edad: number;
    profesion?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Component({
  selector: 'app-field-interview',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, RouterLink, FormsModule, NgIf, CommonModule, TruncatePipePipe],
  templateUrl: './field-interview.component.html',
  styleUrl: './field-interview.component.css'
})
export class FieldInterviewComponent {
  intervieweeForm!: FormGroup;
  editForm!: FormGroup;
  interviews: FieldInterview[] = [];
  filteredInterviews: FieldInterview[] = [];
  selectedInterview: FieldInterview | null = null;
  searchTerm = '';
  selectedDeclaration: string = '';
  currentUser: User | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private interviewService: InterviewService) {
    this.initializeForms()
  }

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.loadInterviews()
    this.currentUser = this.authService.currentUserValue;
  }

  //Inicializa los formularios editForm e intervieweeForm
  private initializeForms(): void {
    this.editForm = this.fb.group({
      nombre: ['', Validators.required],
      declaracion: ['', Validators.required],
      cedula: ['', Validators.required],
      edad: ['', Validators.required],
      profesion: ['', Validators.required]
    });

    this.intervieweeForm = this.fb.group({
      nombre: ['', Validators.required],
      cedula: ['', Validators.required],
      edad: ['', Validators.required],
      profesion: ['', Validators.required]
    });
  }

  //Carga todas las entrevistas desde el servicio
  loadInterviews(): void {
    this.interviewService.getInterviews().subscribe({
      next: (res: any) => {
        this.interviews = res.data || res; // Ajusta según la respuesta de tu API
        this.filteredInterviews = [...this.interviews];
      },
      error: (err) => {
        console.error('Error cargando entrevistas:', err);
      }
    });
  }

  //Abre el modal con la declaración seleccionada
  openDeclarationModal(declaracion: string): void {
    this.selectedDeclaration = declaracion;
  }

  //Filtra entrevistas según el término de búsqueda
  applyFilter(): void {
    const searchTerm = this.searchTerm.trim().toLocaleLowerCase();
    if (!searchTerm) {
      this.filteredInterviews = [...this.interviews]; // Si no hay búsqueda, mostrar todas
      return;
    }

    // Implementa lógica de filtrado
    this.filteredInterviews = this.interviews.filter(interview =>
      interview.entrevistado?.cedula?.includes(searchTerm) ||
      interview.entrevistado?.name?.toLowerCase().includes(searchTerm)
    );
  }

  //Prepara una entrevista para ser editada
  onEditInterview(interview: FieldInterview): void {
    this.selectedInterview = interview;

    this.editForm.patchValue({
      nombre: interview.entrevistado?.name || '',  // Verifica si el campo existe
      cedula: interview.entrevistado?.cedula || '',
      edad: interview.entrevistado?.edad || '',
      profesion: interview.entrevistado?.profesion || '',
      declaracion: interview.declaracion || '',
    });
  }

  //Guarda los cambios en la entrevista editada
  onSaveEdit(): void {
    if (!this.editForm.valid || !this.selectedInterview) return;

    const updateData = this.editForm.value;

    this.interviewService.updateInterview(this.selectedInterview._id, updateData).subscribe({
      next: (res: any) => {
        alert('Entrevista actualizada exitosamente');
        this.loadInterviews();
        this.selectedInterview = res;

        if (res.entrevistado) {
          this.intervieweeForm.patchValue({
            nombre: res.entrevistado.name,
            cedula: res.entrevistado.cedula,
            edad: res.entrevistado.edad,
            profesion: res.entrevistado.profesion
          });
        }

        this.selectedInterview = null;
      },
      error: (err) => {
        console.error('Error al actualizar la entrevista:', err);
        alert('Error al actualizar la entrevista');
      }
    });
  }

  //  Elimina una entrevista tras confirmar la acción
  deleteInterview(interviewId: string): void {
    if (!confirm('¿Estás seguro de que deseas eliminar esta entrevista?')) return;
    this.interviewService.deleteInterview(interviewId).subscribe({
      next: () => {
        this.loadInterviews();
      },
      error: (err) => {
        console.error('Error al eliminar la entrevista:', err);
      }
    });

  }

  generatePDF(interview: any) {
    if (!interview) {
      alert('No hay entrevista seleccionada.');
      return;
    }
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
          /* entrevistado.cedula || 'N/A',
          entrevistado.edad || 'N/A',
          entrevistado.profesion || 'N/A' */
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
    const entrevistado = interview.entrevistado || {};
    doc.setFontSize(12);
    doc.text("DATOS DEL ENTREVISTADO", margin, yPos);
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Nombre', 'Cédula', 'Edad', 'Profesión']],
      body: [[
        entrevistado.name || 'N/A',
        entrevistado.cedula || 'N/A',
        entrevistado.edad || 'N/A',
        entrevistado.profesion || 'N/A'
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
    const declaracion = interview.declaracion || 'No se registraron declaraciones';
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
    doc.text(this.currentUser?.username || '', pageWidth - 70, doc.internal.pageSize.getHeight() - 30);
    doc.text(`Placa: ${numeroExpediente || ''}`,
      pageWidth - 70, doc.internal.pageSize.getHeight() - 25);

    doc.save(`ACTA_ENTREVISTA${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
