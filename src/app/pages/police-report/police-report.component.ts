import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, NgModel, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../../lib/types/user';
import { PoliceReportService } from '../../services/police-report/police-report.service';
import { policeReport } from '../../../lib/types/policeReport';
import { RouterLink } from '@angular/router';
import { TruncatePipePipe } from '../../shared/pipe/truncate-pipe.pipe';
import { CommonModule } from '@angular/common';
import { InvolvedPerson } from '../../../lib/types/InvolvedPerson';

@Component({
  selector: 'app-police-report',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, TruncatePipePipe, CommonModule],
  templateUrl: './police-report.component.html',
  styleUrl: './police-report.component.css'
})
export class PoliceReportComponent {
  currentUser: User | null = null;
  incidentForm!: FormGroup;
  evidenceForm!: FormGroup;
  policeReport: policeReport[] = [];
  filteredPoliceReport: policeReport[] = [];
  searchTerm: string = '';
  selectedReport: policeReport | null = null;
  editForm!: FormGroup;


  constructor(private fb: FormBuilder, private authService: AuthService, private policeReportService: PoliceReportService) {
    // Inicializar formularios con campos vacíos
    this.incidentForm = this.fb.group({
      location: ['', Validators.required],
      description: ['', Validators.required],
      time: ['', Validators.required],
      securityMeasures: ['', Validators.required],
      observations: ['', Validators.required],
      attachments: [''],
    });


    // Inicializar evidenceForm
    this.evidenceForm = this.fb.group({
      items: this.fb.array([])
    });

    this.editForm = this.fb.group({
      location: [''],
      description: [''],
      time: [''],
      securityMeasures: [''],
      observations: [''],
      attachments: [''],
    });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.currentUser = this.authService.currentUserValue;
    this.loadPoliceReport();
  }

  loadPoliceReport(): void {
    this.policeReportService.getPoliceReport().subscribe({
      next: (reports: any) => {
        console.log('Respuesta del servidor:', reports); // Muestra la respuesta en la consola
        this.policeReport = reports; // Ajusta según la respuesta de tu API
        this.filteredPoliceReport = [...this.policeReport];
      },
      error: (err) => {
        console.error('Error cargando entrevistas:', err);
      }
    });
  }


  //Filtra entrevistas según el término de búsqueda
  applyFilter(): void {
    const searchTerm = this.searchTerm.trim().toLocaleLowerCase();
    if (!searchTerm) {
      this.filteredPoliceReport = [...this.policeReport]; // Si no hay búsqueda, mostrar todas
      console.log(this.filteredPoliceReport)
      return;
    }

    // Implementa lógica de filtrado
    this.filteredPoliceReport = this.policeReport.filter(report =>
      report.location?.toLowerCase().includes(searchTerm) ||
      report.description.toLowerCase().includes(searchTerm) ||
      report?.involvedPeople.some((person: any) =>
        person?.name?.toLowerCase().includes(searchTerm)
      )
    );

  }

  loadInterviews(): void {
    this.policeReportService.getPoliceReport().subscribe({
      next: (res: any) => {
        this.policeReport = res.data || res; // Ajusta según la respuesta de tu API
        this.filteredPoliceReport = [...this.policeReport];
      },
      error: (err) => {
        console.error('Error cargando entrevistas:', err);
      }
    });
  }

  //Prepara una entrevista para ser editada
  onEditInterview(report: policeReport): void {
    this.selectedReport = report;

    this.editForm.patchValue({
      location: report.location || "",
      description: report.description || "",
      time: report.time || "",
      securityMeasures: report.securityMeasures || "",
      observations: report.observations || "",
      attachments: report.attachments || "",
    });
  }

  //Guarda los cambios en la entrevista editada
  onSaveEdit(): void {
    if (!this.editForm.valid || !this.selectedReport) return;

    const updateData = this.editForm.value;

    if (!this.selectedReport || !this.selectedReport._id) return;

    this.policeReportService.editInterview(this.selectedReport._id, updateData).subscribe({
      next: (res: any) => {
        alert('Entrevista actualizada exitosamente');
        console.log(res)
        this.loadInterviews();
        this.selectedReport = null;
      },
      error: (err) => {
        console.error('Error al actualizar la entrevista:', err);
        alert('Error al actualizar la entrevista');
      }
    });
  }

  deleteReport(reportId: string) {
    return this.policeReportService.deleteReport(reportId).subscribe({
      next: () => {
        this.loadInterviews();
      },
      error: (err) => console.error('Error eliminando reporte:', err)
    })
  }

  generatePDF(report: any) {
    if (!report) {
      alert('No hay entrevista seleccionada.');
      return;
    }

    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // ========== ENCABEZADO INSTITUCIONAL ==========
    const logo = new Image();
    logo.src = 'logo/cicpc-logo.jpg';

    try {
      doc.addImage(logo, 'JPEG', margin, yPos, 25, 25);
    } catch (error) {
      console.error('Error cargando el logo:', error);
    }

    // Texto institucional con ajuste de tamaño
    doc.setFontSize(10); // Reducir tamaño de fuente
    doc.setFont("helvetica", "bold");

    const headerLines = doc.splitTextToSize(
      "REPÚBLICA BOLIVARIANA DE VENEZUELA - MINISTERIO DEL PODER POPULAR PARA RELACIONES INTERIORES, JUSTICIA Y PAZ - CUERPO DE INVESTIGACIONES CIENTÍFICAS, PENALES Y CRIMINALÍSTICAS (CICPC)",
      pageWidth - margin * 2 - 30 // Ancho disponible
    );

    doc.text(headerLines, margin + 30, yPos + 10);

    // Datos de ubicación y fecha
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Dependencia: ${this.currentUser?._id}`, margin + 30, yPos + 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })} | Lugar: ${report.location}`,
      margin + 30, yPos + 36);

    // Línea divisoria
    yPos += 45;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    // ========== CONTENIDO PRINCIPAL ==========
    const addSection = (title: string, content: any, isTable = false) => {
      if (yPos > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPos += 15);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos + 2, margin + 40, yPos + 2);

      if (isTable) {
        autoTable(doc, {
          startY: yPos + 10,
          ...content,
          didDrawPage: (data) => {
            if (data.cursor) { // Verificar si data.cursor existe
              yPos = data.cursor.y; // Actualizar yPos solo si data.cursor está definido
            }
          }
        });
      } else {
        const lines = doc.splitTextToSize(content, pageWidth - margin * 2);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(lines, margin, yPos += 10);
        yPos += lines.length * 5;
      }
    };

    // ========== SECCIONES DINÁMICAS ==========
    try {
      if (this.currentUser)
        // Sección Funcionario
        addSection('FUNCIONARIO ACTUANTE', {
          head: [['Datos del Funcionario']],
          body: [
            [`Nombre: ${this.currentUser.username}`],
            [`Rango: ${this.currentUser._id}`],
            [`Cédula: ${this.currentUser._id}`],
            [`Placa: ${this.currentUser._id}`]
          ],
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          margin: { left: margin }
        }, true);

      // Título Centrado
      doc.setFontSize(14);
      const titleWidth = doc.getStringUnitWidth('ACTA POLICIAL') * doc.getFontSize() / doc.internal.scaleFactor;
      doc.text('ACTA POLICIAL', (pageWidth - titleWidth) / 2, yPos += 20);

      // Descripción de Hechos
      addSection('DESCRIPCIÓN DE LOS HECHOS',
        report.description || 'No se registraron detalles',
        false);

      // Involucrados
      addSection('PERSONAS INVOLUCRADAS', {
        head: [['Nombre', 'Cédula', 'Rol']],
        body: report.involvedPeople.map((p: any) => [p.name, p.cedula || 'N/A', p.role]),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 }
        },
        margin: { left: margin }
      }, true);

      // Actuaciones Policiales
      addSection('ACTUACIONES REALIZADAS', {
        body: [
          ['Evidencias:', (report.evidenceItems || []).join(', ') || 'Sin evidencias'],
          ['Medidas de Seguridad:', report.securityMeasures || 'N/A'],
          ['Hora Intervención:', report.time || 'N/A']
        ],
        styles: { fontSize: 9 },
        margin: { left: margin }
      }, true);

      // Observaciones y Anexos
      addSection('OBSERVACIONES', report.observations || 'Ninguna', false);
      addSection('ANEXOS', report.attachments || 'Ninguna', false);

      // ========== FIRMAS Y SELLO ==========
      if (yPos > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPos = 20;
      }

      const sello = new Image();
      sello.src = 'logo/cicpc-logo.jpg';
      doc.addImage(sello, 'PNG', margin, yPos + 10, 30, 30);

      if (this.currentUser) {
        doc.setFontSize(10);
        doc.text("FUNCIONARIO RESPONSABLE", pageWidth - 70, yPos + 20);
        doc.text("_________________________", pageWidth - 70, yPos + 25);
        doc.text(this.currentUser.username, pageWidth - 70, yPos + 35);
        doc.text(`${this.currentUser._id} | Placa: ${this.currentUser._id}`,
          pageWidth - 70, yPos + 40);
      }

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el documento');
    }

    doc.save(`ACTA_POLICIAL_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
