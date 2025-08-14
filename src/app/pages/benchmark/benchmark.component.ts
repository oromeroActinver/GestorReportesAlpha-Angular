import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-benchmark',
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule],
  templateUrl: './benchmark.component.html',
  styleUrl: './benchmark.component.css'
})
export class BenchmarkComponent {

apiUrl = environment.API_URL;
  isLoading: boolean = false;
  selectedFile: File | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file ? file : null;
  }

  uploadFiles(): void {
    if (!this.selectedFile) {
      this.showDialog('MESSAGE', 'Seleccione al menos un archivo.');
      return;
    }

    this.isLoading = true;
    const formData: FormData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    const url = `${environment.API_URL}/Bench/upload`;
    const token = localStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.post(url, formData, { headers }).subscribe(
        (response: any) => {
          this.isLoading = false;
          switch (response.status) {
            case 'SUCCESS':
              this.showDialog('SUCCESS', response.message, response.details);
              break;
            case 'FAILED':
              this.showDialog('FAILED', response.message, response.details);
              break;
            case 'PARTIAL_SUCCESS':
              this.showDialog('PARTIAL SUCCESS', response.message, response.details);
              break;
            default:
              this.showDialog('Error', 'Estado de respuesta desconocido');
          }
          this.clearSelectedFiles();
        },
        error => {
          this.isLoading = false;
          this.showDialog('FAILED', 'Error al subir el archivo: ' + error.message);
          this.clearSelectedFiles();
        }
      );
    } else {
      this.isLoading = false;
      this.showDialog('FAILED', 'No se encontró un token de autenticación.');
    }
  }

  clearSelectedFiles(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

}
