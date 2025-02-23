import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
/*   debugger; */

  const authService = inject(AuthService)

  const token = authService.getToken();

  if (token) {
    const authReq = req.clone({
      withCredentials: true
    });
    return next(authReq);
  }
  /* if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Añade el token al header
      }
    });
    return next(authReq);
  } */

  return next(req);
};
