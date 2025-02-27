export interface Interview {
    _id: string; // ID generado por MongoDB
    date: Date; // Fecha de la entrevista
    location: string; // Ubicación de la entrevista
    description: string; // Descripción de la entrevista
    entrevistado: {
      _id: string; // ID del entrevistado
      name: string; // Nombre del entrevistado
      cedula: string; // Cédula del entrevistado
      edad: number; // Edad del entrevistado
      profesion: string; // Profesión del entrevistado
    };
    createdAt: Date; // Fecha de creación
    updatedAt: Date; // Fecha de actualización
  }