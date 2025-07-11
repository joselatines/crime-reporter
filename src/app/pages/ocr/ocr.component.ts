import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Tesseract from 'tesseract.js';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-ocr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.css']
})
export class OcrComponent implements OnInit {
  imageFile: File | null = null;
  imgURL: string | null = null; // URL para la vista previa
  ocrResult: string = ''; // Resultado OCR
  loading: boolean = false; // Indicador de carga
  ocrHistory: any[] = []; // Historial de OCR
  currentUser: any = null; // Cambia el tipo según tu modelo de usuario

  private readonly API_URL = 'https://crime-reporter-api.onrender.com/api/v1/ocr';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.getOcrHistory();
  }

  getOcrHistory() {
    this.http.get<any>(this.API_URL).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.ocrHistory = res;
        } else if (res && Array.isArray(res.data)) {
          this.ocrHistory = res.data;
        } else {
          this.ocrHistory = [];
        }
      },
      error: (err) => {
        console.error('Error obteniendo historial OCR:', err);
      }
    });
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imgURL = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  extractText() {
    if (this.imgURL) {
      this.loading = true;
      this.ocrResult = ''; // Reiniciar resultado antes de procesar
      Tesseract.recognize(
        this.imgURL,
        'eng',
        { logger: info => console.log(info) }
      ).then(({ data: { text } }) => {
        this.ocrResult = text;
        this.loading = false;
        setTimeout(() => {
          if (window.confirm('¿Desea guardar este resultado en el historial?')) {
            this.saveOcrResult(text);
          }
        }, 100); // Pequeño delay para asegurar renderizado
      }).catch(err => {
        console.error("Error OCR:", err);
        this.loading = false;
      });
    }
  }

  saveOcrResult(text: string) {
    if (!this.imageFile) {
      alert('No hay imagen cargada para guardar.');
      return;
    }
    if (!this.currentUser || !this.currentUser._id) {
      alert('No se pudo obtener el usuario actual.');
      return;
    }
    const formData = new FormData();
    formData.append('text', text);
    formData.append('image', this.imageFile);
    formData.append('user_id', this.currentUser._id);

    this.http.post(this.API_URL, formData).subscribe({
      next: () => {
        this.getOcrHistory();
        alert('Resultado guardado en el historial.');
      },
      error: (err) => {
        console.error('Error guardando resultado OCR:', err);
        alert(err?.error?.message || 'No se pudo guardar el resultado.');
      }
    });
  }

  copyText() {
    if (this.ocrResult) {
      navigator.clipboard.writeText(this.ocrResult).then(() => {
        console.log("Texto copiado al portapapeles.");
      }).catch(err => console.error("Error al copiar texto:", err));
    }
  }

  downloadImage(base64: string, id: string = '') {
    // Extraer el tipo de imagen del string base64
    const matches = base64.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = matches ? matches[1] : 'image/png';
    const extension = mimeType.split('/')[1] || 'png';

    const link = document.createElement('a');
    link.href = base64;
    link.download = `ocr_imagen_${id || Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

