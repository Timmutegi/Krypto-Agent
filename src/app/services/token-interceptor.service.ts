import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (req.headers.get('no-auth') === 'true') {
      return next.handle(req);
    }

    const tokenizedReq = req.clone({
      setHeaders: {
        Authorization: 'Token ' + localStorage.getItem('accessToken')
      }
    });
    return next.handle(tokenizedReq);
  }
}
