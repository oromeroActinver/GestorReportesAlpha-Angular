import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { RendimientosDialogComponent } from '../rendimientos-dialog/rendimientos-dialog.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../login/AuthService';
import { Utilities } from '../../services/tempUtilities';
import { MatDialog } from '@angular/material/dialog';
import { EstrategiasService } from '../../services/EstrategiasService';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

export enum UploadMethod {
  DATES = 'DATES',
  FOLDER = 'FOLDER'
}

@Component({
  selector: 'app-calcula-rendimientos',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, FormsModule,
    CommonModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  templateUrl: './calcula-rendimientos.component.html',
  styleUrl: './calcula-rendimientos.component.css'
})
export class CalculaRendimientosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('RendimientosDialogComponent') dialogCargarBenchmark!: TemplateRef<any>;


  fechas: string = 'Calcular por fechas';
  calcular: string = 'Calcular';
  inputSelestPath = 'Seleccionar Archivos';
  uploadButton = 'Cargar Reportes';
  saveFiles = 'Guardar';
  uploadMethod = 'file';
  isLoading = false;
  files: File[] = [];
  folderPath: string | null = null;
  selectedYear: number | null = null;
  selectedMonth: string | null = null;
  // Listas de opciones
  years: number[] = [];
  months: string[] = [];
  // Formulario
  rendimientosForm: FormGroup;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = ['Cuenta', 'FechaInicio', 'SaldoInicio', 'Saldo', 'TIRAnualizada', 'TIREfectiva'];
  selectedFile: File | null = null;


  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private utilities: Utilities,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.rendimientosForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    }, { validator: this.dateValidator });
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.initializeDateOptions();
    this.validateToken();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  private initializeDateOptions(): void {
    const currentYear = new Date().getFullYear();
    const pastYears = currentYear - 10;

    for (let year = currentYear; year >= pastYears; year--) {
      this.years.push(year);
    }

    this.months = this.utilities.getMonthNames();
  }

  private validateToken(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
      return;
    }

    this.authService.validateToken(token).subscribe({
      error: (error) => {
        const errorMessage = error.error?.token || 'Error al validar el token';
        this.showDialog('FAILED', errorMessage);
        this.router.navigate(['/']);
      }
    });
  }
  
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.files = Array.from(input.files).filter(file =>
        file.type === 'application/pdf'
      );

      if (this.files.length !== input.files.length) {
        this.showDialog('MESSAGE', 'Algunos archivos no son PDF y fueron ignorados.');
      }
    }
  }

  clearSelectedFiles(): void {
    this.files = [];
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  uploadFiles(): void {
    if (this.files.length === 0) {
      this.showDialog('MESSAGE', 'Seleccione al menos un archivo.');
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    this.files.forEach(file => {
      formData.append('files', file, file.name);
    });

    const token = localStorage.getItem('token');
    if (!token) {
      this.showDialog('FAILED', 'No se encontró un token de autenticación.');
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${environment.API_URL}/files/uploadFiles`;

    this.http.post(url, formData, { headers }).subscribe({
      next: (response: any) => this.handleUploadResponse(response),
      error: (error) => this.handleUploadError(error)
    });
  }

  uploadFolderPath(): void {
    if (!this.selectedYear || !this.selectedMonth) {
      this.showDialog('MESSAGE', 'Por favor, seleccione Año y Mes.');
      return;
    }

    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.showDialog('FAILED', 'No se encontró un token de autenticación.');
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const monthIndex = this.months.indexOf(this.selectedMonth) + 1;
    const body = {
      year: this.selectedYear,
      month: monthIndex
    };

    const url = `${environment.API_URL}/Rend/rendimientos`;

    this.http.post(url, body, { headers }).subscribe({
      next: (response: any) => this.handleUploadResponse(response),
      error: (error) => this.handleUploadError(error)
    });
  }

  private handleUploadResponse(response: any): void {
    this.isLoading = false;

    switch (response?.status) {
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
  }

  private handleUploadError(error: any): void {
    this.isLoading = false;
    const errorMessage = error.error?.message || error.message || 'Error desconocido al subir archivos';
    this.showDialog('FAILED', errorMessage);
    this.clearSelectedFiles();
  }

  onSubmit(): void {
    if (this.rendimientosForm.invalid) {
      this.showDialog('FAILED', 'Por favor complete los campos requeridos correctamente.');
      return;
    }

    const formData = this.rendimientosForm.value;
    const fechasMensualesCompletas = formData.fechaInicio && formData.fechaFin;

    if (!fechasMensualesCompletas) {
      this.showDialog('FAILED', 'Debe completar ambas fechas.');
      return;
    }

    this.isLoading = true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      fechInicio: this.formatDateToYYYYMMDD(formData.fechaInicio),
      fechFinal: this.formatDateToYYYYMMDD(formData.fechaFin)
    };

    const url = `${environment.API_URL}/Rend/getRendByFechs`;

    this.http.post(url, body, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response?.status === 'SUCCESS') {

          const tableData = this.parseResponseToTableData(response.details);
          this.dataSource = new MatTableDataSource(tableData);

          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'FechaInicio':
                return new Date(item.FechaInicio).getTime();
              case 'SaldoInicio':
              case 'Saldo':
                return parseFloat(item[property]);
              case 'TIRAnualizada':
              case 'TIREfectiva':
                return parseFloat(item[property]);
              default:
                return item[property];
            }
          };

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });

          if (tableData.length === 0) {
            this.showDialog('MESSAGE', 'No se encontraron resultados para las fechas seleccionadas.');
          }
        } else {
          this.showDialog('FAILED', response?.message || 'Error al obtener los datos');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showDialog('FAILED', 'Error al calcular rendimientos: ' + (error.error?.message || error.message));
      }
    });
  }

  loadData(data: any[]) {
    this.dataSource = new MatTableDataSource(data);

    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'FechaInicio':
          return new Date(item.FechaInicio);
        case 'SaldoInicio':
        case 'Saldo':
          return Number(item[property]);
        default:
          return item[property];
      }
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = Object.keys(data).map(key => {
        if (key === 'FechaInicio') {
          return this.formatDateForFilter(data[key]);
        }
        if (['SaldoInicio', 'Saldo', 'TIRAnualizada', 'TIREfectiva'].includes(key)) {
          return data[key].toString().replace(/[^0-9.-]/g, '');
        }
        return data[key] ? data[key].toString().toLowerCase() : '';
      }).join('◬');

      return dataStr.indexOf(filter.toLowerCase()) !== -1;
    };

    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private formatDateForFilter(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  private parseResponseToTableData(details: string[]): any[] {
    return details.map(detail => {
      const parts = detail.split(', ');
      const row: any = {};

      parts.forEach(part => {
        const [key, value] = part.split(': ');
        switch (key.trim()) {
          case 'Cuenta':
            row['Cuenta'] = value.trim();
            break;
          case 'FechaInicio':
            row['FechaInicio'] = value.trim();
            break;
          case 'Fecha':
            row['FechaFin'] = value.trim();
            break;
          case 'SaldoInicio':
            row['SaldoInicio'] = parseFloat(value.trim());
            break;
          case 'Saldo':
            row['Saldo'] = parseFloat(value.trim());
            break;
          case 'TIR Anualizada':
            row['TIRAnualizada'] = parseFloat(value.trim());
            break;
          case 'TIR Efectiva':
            row['TIREfectiva'] = parseFloat(value.trim());
            break;
        }
      });

      return row;
    });
  }

  private dateValidator(group: FormGroup): { [key: string]: any } | null {
    const fechaInicio = group.get('fechaInicio')?.value;
    const fechaFin = group.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (fin <= inicio) return { invalidDates: 'La fecha fin debe ser mayor que la fecha inicio' };
    }

    return null;
  }

  formatDateToYYYYMMDD(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}${month}${day}`;
  }

  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '400px',
      data: {
        messageTitle: title,
        messageContent: content,
        details: details
      }
    });
  }

  uploadFileRendimientos(): void {
    this.isLoading = true;
    if (!this.selectedFile) {
      this.showDialog('MESSAGE', 'Seleccione un archivo.');
      return;
    }
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
              this.dialog.closeAll();
              this.showDialog('SUCCESS', response.message, response.details);
              break;
            case 'FAILED':
              this.dialog.closeAll();
              this.showDialog('FAILED', response.message, response.details);
              break;
            case 'PARTIAL_SUCCESS':
              this.dialog.closeAll();
              this.showDialog('PARTIAL SUCCESS', response.message, response.details);
              break;
            default:
              this.dialog.closeAll();
              this.showDialog('FAILED', 'Estado de respuesta desconocido');
          }
          this.clearSelectedFiles();
        },
        error => {
          this.isLoading = false;
          this.dialog.closeAll();
          this.showDialog('FAILED', 'Error al subir el archivo: ' + error.message);
          this.clearSelectedFiles();
        }
      );
    } else {
      this.isLoading = false;
      this.dialog.closeAll();
      this.showDialog('FAILED', 'No se encontró un token de autenticación.');
    }
  }

  abrirDialogRendimientos(): void {
    this.dialog.open(this.dialogCargarBenchmark, {
      width: '500px'
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file ? file : null;
  }

  openRendimientosDialog(): void {
    this.dialog.open(RendimientosDialogComponent, {
      width: '900px',
      height: '300px',
      panelClass: 'custom-dialog'
    });
  }

  setUploadMethod(method: string): void {
    this.uploadMethod = method;
  }

}