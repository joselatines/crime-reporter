import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
import { map,} from 'rxjs';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router)

    return authService.getUserRole().pipe(
      map((role) => {
        if (role === 'admin') {
          return true; // Permite el acceso si el usuario es administrador
        } else {
          router.navigate(['/unauthorized']); // Redirige si no es admin
          return false;
        }
      })
    );
};
