import { inject } from '@angular/core';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { switchMap, take } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AngularFireAuth);
  return auth.idToken.pipe(
    take(1),
    switchMap(token => next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req))
  );
};
