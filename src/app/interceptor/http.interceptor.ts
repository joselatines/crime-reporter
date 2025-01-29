import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {

  // Clonar la solicitud y habilitar withCredentials
  const modifiedReq = req.clone({
    withCredentials: true
  });


  return next(modifiedReq);
};
