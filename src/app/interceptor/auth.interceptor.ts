import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService)

  const token = localStorage.getItem('token');
/*   const token = authService.getToken(); */

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Añade el token al header
      }
    });
    console.log('Token añadido a la solicitud:', authReq.headers.get('Authorization'));
    return next(authReq);
  }

  return next(req);
};
