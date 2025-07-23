import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../pages/login/AuthService';
import { Utilities } from '../services/tempUtilities';
import { MatDialog } from '@angular/material/dialog';
import { EstrategiasService } from '../pages/dispercion/EstrategiasService';
import { MessageDetailsDialogComponent } from '../pages/message-details-dialog/message-details-dialog.component';

@Component({
  selector: 'app-repor-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    FormsModule],
  templateUrl: './repor-upload.component.html',
  styleUrl: './repor-upload.component.css'
})
export class ReporUploadComponent {
  section = 'Carga de Reportes';
  inputSelestPath = 'Seleccionar Archivos';
  apiUrl = environment.API_URL;
  uploadButton = 'Cargar Reportes';
  saveFiles = 'Guardar';
  selectedFiles: FileList | null = null;
  isLoading: boolean = false;
  folderPath: string | null = null;
  uploadMethod = 'file';

  files: File[] = [];
  years: number[] = [];
  months: string[] = [];

  selectedYear: number | null = null;
  selectedMonth: string | null = null;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService,
    private estrategiasService: EstrategiasService, private utilities: Utilities,
    private dialog: MatDialog) {
    const currentYear = new Date().getFullYear();
    this.months = utilities.getMonthNames();
    const pastYears = currentYear - 10;
    for (let year = currentYear; year >= pastYears; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');

    if (token) {
      this.authService.validateToken(token).subscribe(
        response => {
          console.info("Token vallido");
        },
        error => {
          if (error.error.token === "El token de autenticación ha expirado." || error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al validar el token');
            this.router.navigate(['/']);
          }
          console.error(error);
        }
      );
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
  }

  setUploadMethod(method: string): void {
    this.uploadMethod = method;
  }

  uploadFiles(): void {
    if (this.selectedYear && this.selectedMonth) {

      if (!this.files || this.files.length === 0) {
        this.showDialog('MESSAGE', 'Seleccione al menos un archivo.');
        return;
      }

      this.isLoading = true;
      const formData: FormData = new FormData();
      const monthIndex = this.months.indexOf(this.selectedMonth) + 1;
      this.files.forEach(file => {
        formData.append('files', file, file.name);
      });
      formData.append('year', this.selectedYear.toString());
      formData.append('month', monthIndex.toString());

      const url = `/api/reportesAlpha/saveReport`;
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
            this.showDialog('FAILED', 'Error al subir los archivos: ' + error.message);
            this.clearSelectedFiles();
          }
        );
      } else {
        this.isLoading = false;
        this.showDialog('FAILED', 'No se encontró un token de autenticación.');
      }
    } else {
      this.showDialog('MESSAGE', 'Seleccione Año y Mes.');
    }
  }

  uploadFolderPath(): void {
    if (this.selectedYear && this.selectedMonth) {
      if (!this.folderPath) { 
        this.showDialog('MESSAGE', 'Ingresa la ruta donde se tomarán los archivos ALPHA.');
        return;
      }

      this.isLoading = true;
      const url = `/api/files/pathfiles`;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      const body = {
        folderPath: this.folderPath,
        year: this.selectedYear,
        month: this.months.indexOf(this.selectedMonth) + 1
      };

      this.http.post(url, body, { headers }).subscribe(
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
              this.showDialog('FAILED', 'Estado de respuesta desconocido');
          }
          this.clearSelectedFiles();
        },
        error => {
          this.isLoading = false;
          this.showDialog('FAILED', 'Error al subir los archivos: ');
          console.log(error.message)
          this.clearSelectedFiles();
        }
      );
    } else {
      this.showDialog('MESSAGE', 'Por favor, seleccione Año, Mes.');
    }
  }

  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

  onFileChanged(event: any): void {
    this.selectedFiles = (event.target as HTMLInputElement).files;
  }

  onFilesSelected(event: any): void {
    this.files = Array.from(event.target.files as File[]).filter(file => file.type === 'application/pdf');
  }

  clearSelectedFiles(): void {
    this.files = [];
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
