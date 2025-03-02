import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Tesseract from 'tesseract.js';

@Component({
  selector: 'app-ocr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.css']
})
export class OcrComponent {
  imageFile: File | null = null;
  imgURL: string | null = null; // URL para la vista previa
  ocrResult: string = ''; // Resultado OCR
  loading: boolean = false; // Indicador de carga

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
      }).catch(err => {
        console.error("Error OCR:", err);
        this.loading = false;
      });
    }
  }

  copyText() {
    if (this.ocrResult) {
      navigator.clipboard.writeText(this.ocrResult).then(() => {
        console.log("Texto copiado al portapapeles.");
      }).catch(err => console.error("Error al copiar texto:", err));
    }
  }
}

