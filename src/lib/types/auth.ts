// src/app/auth/types/auth.types.ts
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role: "admin" | "detective";
  }
  
  export interface LoginData {
    email: string;
    password: string;
  }

  export interface LoginResponse {
    token: string;
    message?: string; // Propiedad opcional
    user?: { 
      _id: string;
      role: 'admin' | 'detective';
    };
  }
  
  export interface AuthResponse {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }
  