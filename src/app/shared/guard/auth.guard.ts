import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { loginPath } from '../app.routes';

export const authGuard: CanActivateFn = (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser().pipe(
    map(user => {
      if (!user) router.navigate([`/${loginPath}`], state.url !== '/' ? { queryParams: { returnUrl: state.url } } : {});
      return !!user;
    })
  );
};
