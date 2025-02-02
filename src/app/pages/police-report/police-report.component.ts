import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthService } from '../../services/auth/auth.service';
import { InvolvedPeopleComponent } from "./involved-people/involved-people.component";
import { EvidenceListComponent } from "./evidence-list/evidence-list.component";
import { IncidentFormComponent } from "./incident-form/incident-form.component";
import { User } from '../../../lib/types/user';

@Component({
  selector: 'app-police-report',
  standalone: true,
  imports: [ReactiveFormsModule, InvolvedPeopleComponent, EvidenceListComponent, IncidentFormComponent],
  templateUrl: './police-report.component.html',
  styleUrl: './police-report.component.css'
})
export class PoliceReportComponent {
  currentUser: User | null = null;
  incidentForm: FormGroup = new FormGroup({});
  evidenceForm: FormGroup = new FormGroup({});
  involvedPeople: any[] = [];
  
  constructor(private fb: FormBuilder, private authService: AuthService) {
    // Inicializar formularios con campos vacíos
    this.incidentForm = this.fb.group({
      location: [''],
      description: [''],
      time: [''],
      securityMeasures: [''],
      observations: [''],
      attachments: ['']
    });


    // Inicializar evidenceForm
    this.evidenceForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario actual
    this.currentUser = this.authService.currentUserValue;
  }

  get items(): FormArray {
    return this.evidenceForm.get('items') as FormArray;
  }

  addEvidence() {
    this.items.push(this.fb.control(''));
  }

  addInvolvedPerson() {
    this.involvedPeople.push({ name: '', id: '', role: '' });
  }

  generatePDF() {
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
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })} | Lugar: ${this.incidentForm.value.location}`,
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
      if(this.currentUser)
      // Sección Funcionario
      addSection('FUNCIONARIO ACTUANTE', {
        head: [['Datos del Funcionario']],
        body: [
          [`Nombre: ${this.currentUser.username }`],
          /* [`Rango: ${this.currentUser.rank} ?? "N/A"`], */
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
        this.incidentForm.value.description || 'No se registraron detalles',
        false);

      // Involucrados
      addSection('PERSONAS INVOLUCRADAS', {
        head: [['Nombre', 'Cédula', 'Rol']],
        body: this.involvedPeople.map(p => [p.name, p.id || 'N/A', p.role]),
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
          ['Evidencias:', this.evidenceForm.value.items.join(', ') || 'N/A'],
          ['Medidas de Seguridad:', this.incidentForm.value.securityMeasures || 'N/A'],
          ['Hora Intervención:', this.incidentForm.value.time || 'N/A']
        ],
        styles: { fontSize: 9 },
        margin: { left: margin }
      }, true);

      // Observaciones y Anexos
      addSection('OBSERVACIONES', this.incidentForm.value.observations || 'Ninguna', false);
      addSection('ANEXOS', this.incidentForm.value.attachments || '1. Fotografías\n2. Listado de evidencias', false);

      // ========== FIRMAS Y SELLO ==========
      if (yPos > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPos = 20;
      }

      const sello = new Image();
      sello.src = 'logo/cicpc-logo.jpg';
      doc.addImage(sello, 'PNG', margin, yPos + 10, 30, 30);

      if(this.currentUser){
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

  /*   generatePDF() {
      const doc = new jsPDF();
      const margin = 10;
      let yPos = 15;
  
      // Logo y Encabezado
      const logo = new Image();
      logo.src = 'logo/cicpc-logo.jpg'; // Asegúrate de tener esta imagen en assets
      doc.addImage(logo, 'PNG', margin, 5, 30, 15);
  
      // Encabezado institucional
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Cuerpo de Investigaciones Científicas, Penales y Criminalísticas', margin + 35, 12);
      doc.text('Sistema Integrado de Gestión Policial - Delegación Caracas', margin + 35, 17);
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.line(margin, 22, 200 - margin, 22);
  
      // Título del informe
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORME POLICIAL', margin, yPos += 20);
  
      // Datos básicos del caso
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`N° Expediente: ${this.incidentData.caseNumber}`, margin, yPos += 10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 100, yPos);
      doc.text(`Ubicación: ${this.incidentData.location}`, margin, yPos += 5);
  
      // Sección Víctima
      autoTable(doc, {
        startY: yPos + 10,
        head: [['Nombre', 'Cédula', 'Edad', 'Dirección']],
        body: [[
          this.victimForm.value.nombre || 'N/A',
          this.victimForm.value.cedula || 'N/A',
          this.victimForm.value.edad || 'N/A',
          this.victimForm.value.direccion || 'N/A'
        ]],
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        styles: { fontSize: 10 }
      });
  
      // Sección Sospechoso
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Nombre/Alias', 'Identificación', 'Descripción Física', 'Vehículo']],
        body: [[
          this.suspectForm.value.nombre || 'Desconocido',
          this.suspectForm.value.cedula || 'N/A',
          this.suspectForm.value.descripcion || 'N/A',
          this.suspectForm.value.vehiculo || 'N/A'
        ]],
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        styles: { fontSize: 10 }
      });
  
      // Descripción del incidente
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('NARRATIVA DEL INCIDENTE', margin, (doc as any).lastAutoTable.finalY + 15);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.text(this.incidentData.description, margin, (doc as any).lastAutoTable.finalY + 20, {
        maxWidth: 180,
      });
  
      // Evidencias
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [['Evidencias Recolectadas']],
        body: this.incidentData.evidence.map((e: string) => [e]),
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        styles: { fontSize: 10 }
      });
  
      // Firma y sello
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('FUNCIONARIO RESPONSABLE', margin + 120, (doc as any).lastAutoTable.finalY + 30);
      doc.line(margin + 120, (doc as any).lastAutoTable.finalY + 32, margin + 180, (doc as any).lastAutoTable.finalY + 32);
      // Datos del usuario autenticado
      doc.text(`HELO`, margin + 130, (doc as any).lastAutoTable.finalY + 38);
  
      doc.save(`Informe_${this.incidentData.caseNumber}.pdf`);
    } */
}
