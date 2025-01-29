import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { catchError, map, of, } from 'rxjs';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router)

  return authService.getUserInfo().pipe(
    map((userInfo) => {
      if (userInfo && userInfo.role === 'admin') {
        return true; // Permite el acceso si el usuario es administrador
      } else {
        router.navigate(['/unauthorized']); // Redirige si no es admin
        return false;
      }
    }),
    catchError((error) => {
      console.error('Error en adminAuthGuard:', error);
      router.navigate(['/unauthorized']); // Redirige en caso de error
      return of(false);
    })
  );
};
