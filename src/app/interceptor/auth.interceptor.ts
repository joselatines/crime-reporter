import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService)

  const token = authService.getToken();

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}` // Agrega el token al encabezado
    }
  })

  return next(authReq);
};
