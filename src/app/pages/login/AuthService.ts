import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
  private apiUrlValid = `${this.apiUrl}/Login/valido`;

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
  

  /*Token Valido*/
  validateToken(token: string | null): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(this.apiUrlValid, { headers }).pipe(
      catchError(error => {
        let errorMessage = 'Error desconocido al validar el token';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.token}`;
        } else {
          errorMessage = `Error ${error.status}: ${error.error.token}`;
        }
        console.error(errorMessage);
        return throwError(error);
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
