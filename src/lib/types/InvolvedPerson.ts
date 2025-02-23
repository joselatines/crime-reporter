export interface InvolvedPerson {
    _id?: string;
    name: string;
    cedula: string;
    role: "testigo" | "sospechoso" | "víctima";
    edad: number;
  }