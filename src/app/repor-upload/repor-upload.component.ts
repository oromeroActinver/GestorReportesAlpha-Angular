import { Component  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-repor-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule ],
  templateUrl: './repor-upload.component.html',
  styleUrl: './repor-upload.component.css'
})
export class ReporUploadComponent {
  section: string = 'Carga de Reportes';
  inputSelestPath: string = 'Seleccionar Archivos';
  apiUrl = environment.API_URL;
  uploadButton: string = 'Cargar Reportes';
  saveFiles: string = 'Guardar';
  selectedFiles: FileList | null = null;
  isLoading: boolean = false; 
  folderPath: string | null = null;
  uploadMethod: string = 'file'; // 'file' por defecto


  files: File[] = [];
  years: number[] = [];
  months: string[] = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  selectedYear: number | null = null;
  selectedMonth: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const currentYear = new Date().getFullYear();
    const pastYears = currentYear - 10;
    for (let year = currentYear; year >= pastYears; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
        if (token) {
            const decodedToken: any = token; //= jwt_decode(token);
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

            if (decodedToken.exp < currentTime) {
                alert('El token de autenticación ha expirado.');
                this.router.navigate(['/login']); // Redirigir al usuario a la página de inicio de sesión
            }
        } else {
            alert('No se encontró un token de autenticación.');
            this.router.navigate(['/login']); // Redirigir al usuario a la página de inicio de sesión
        } 
   }

  setUploadMethod(method: string): void {
    this.uploadMethod = method;
  }

  uploadFiles(): void {
    if (this.selectedYear && this.selectedMonth) {
      this.isLoading = true; 
        const formData: FormData = new FormData();
        const monthIndex = this.months.indexOf(this.selectedMonth) + 1; 
        this.files.forEach(file => {
            formData.append('files', file, file.name);
        });
        formData.append('year', this.selectedYear.toString());
        formData.append('month', monthIndex.toString());

        const url = `/api/files/uploadFiles`;
        const token = localStorage.getItem('token');

        if (token) {
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            
            this.http.post(url, formData, { headers }).subscribe(
                (response: any) => {
                  this.isLoading = false;
                    switch (response.status) {
                        case 'SUCCESS':
                          alert(response.message + '\n' + response.details.join('\n'));
                            break;
                        case 'FAILED':
                            alert(response.message + '\n' + response.details.join('\n'));
                            break;
                        case 'PARTIAL_SUCCESS':
                            alert(response.message + '\n' + response.details.join('\n'));
                            break;   
                        default:
                            alert('Estado de respuesta desconocido');
                    }
                    this.clearSelectedFiles();
                },
                error => {
                  this.isLoading = false;
                    alert('Error al subir los archivos: ' + error.message);
                    this.clearSelectedFiles();
                }
            );
        } else {
          this.isLoading = false;
            alert('No se encontró un token de autenticación.');
        }
    } else {
        alert('Por favor, seleccione Año y Mes.');
    }
}

uploadFolderPath(): void {
  if (this.selectedYear && this.selectedMonth && this.folderPath) {
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
      month: this.selectedMonth.indexOf(this.selectedMonth) + 1
    };

    this.http.post(url, body, { headers }).subscribe(
      (response: any) => {
        this.isLoading = false;
          switch (response.status) {
              case 'SUCCESS':
                alert(response.message + '\n' + response.details.join('\n'));
                  break;
              case 'FAILED':
                  alert(response.message + '\n' + response.details.join('\n'));
                  break;
              case 'PARTIAL_SUCCESS':
                  alert(response.message + '\n' + response.details.join('\n'));
                  break;
              default:
                  alert('Estado de respuesta desconocido');
          }
          this.clearSelectedFiles();
      },
      error => {
        this.isLoading = false;
          alert('Error al subir los archivos: ' + error.message);
          this.clearSelectedFiles();
      }
  );
  } else {
    alert('Por favor, seleccione Año, Mes y ingrese el path de donde se tomarán los archivos.');
  }
}

onFileChanged(event: any): void {
  this.selectedFiles = (event.target as HTMLInputElement).files;
}


  onFilesSelected(event: any): void {
    this.files = Array.from(event.target.files as File[]).filter(file => file.type === 'application/pdf');
  }

  clearSelectedFiles(): void {
    this.files = [];
  }
}
