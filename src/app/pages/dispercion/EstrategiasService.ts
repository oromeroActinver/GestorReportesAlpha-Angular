import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstrategiasService {
  private apiUrl = '/api/estrategias';

  constructor(private http: HttpClient) { }

  //token = localStorage.getItem('token');

  getEstrategias(token: string | null): Observable<string[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<string[]>(this.apiUrl, { headers }).pipe(
      catchError(error => {
        let errorMessage = 'Error desconocido al obtener estrategias';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error ${error.status}: ${error.error.message}`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }
}