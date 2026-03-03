import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Get token from sessionStorage
  const token = sessionStorage.getItem('token');

  // Clone request and add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Token expired or invalid
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        toastr.error('Session expired. Please login again.');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
