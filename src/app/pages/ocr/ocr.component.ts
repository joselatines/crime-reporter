import { Component } from '@angular/core';
import * as Tesseract from 'tesseract.js';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.css']
})
export class OcrComponent {
  imageFile: File | null = null;
  ocrResult: string = ''; // Variable para almacenar el texto extraído
  loading: boolean = false; // Indicador de carga

  uploadImage(event: any) {
    this.imageFile = event.target.files[0];
    this.extractText();
  }

  extractText() {
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result;
        this.loading = true; // Iniciar el indicador de carga

        Tesseract.recognize(
          imageData,
          'eng', // Cambia el idioma según sea necesario
          {
            logger: info => console.log(info) // Para ver el progreso (opcional)
          }
        ).then(({ data: { text } }) => {
          this.ocrResult = text; // Asigna el texto extraído a la variable
          this.loading = false; // Finalizar el indicador de carga
        }).catch(err => {
          console.error("Error durante el reconocimiento:", err);
          this.loading = false; // Finalizar el indicador de carga en caso de error
        });
      };
      reader.readAsDataURL(this.imageFile);
    }
  }
}
