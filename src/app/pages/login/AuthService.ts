import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { LoginResponse } from './LoginResponse';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  apiUrl = environment.API_URL;

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string): Observable<LoginResponse> {
    const url = `${this.apiUrl}/Login/loginAntiDirectory`;
    const body = { username, password };
    return this.http.post<LoginResponse>(url, body).pipe(
      map(response => {
        if (response.exist) {
          localStorage.setItem('token', response.token);
          this.setAuthStatus(true);
        } else {
          this.setAuthStatus(false);
          return response;
        }
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'Error desconocido';
        if (error.status === 401) {
          errorMsg = 'Credenciales inválidas';
        } else {
          errorMsg = error.error.message || 'Error en el servidor';
        }
        return throwError(errorMsg);
      })
    );
  }

  logout(): void {
    this.setAuthStatus(false);
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  setAuthStatus(status: boolean): void {
    this.isAuthenticated = status;
  }

  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }
}
