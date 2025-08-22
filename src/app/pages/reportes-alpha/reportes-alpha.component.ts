import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Utilities } from '../../services/tempUtilities';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { EstrategiasService } from '../../services/EstrategiasService';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSortModule } from '@angular/material/sort';


export enum UploadMethod {
  DATES = 'DATES',
  FOLDER = 'FOLDER'
}

@Component({
  selector: 'app-reportes-alpha',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatPaginatorModule, MatTooltipModule, MatCheckboxModule, MatTableModule, MatSortModule],
  templateUrl: './reportes-alpha.component.html',
  styleUrl: './reportes-alpha.component.css'
})
export class ReportesAlphaComponent {
  displayedColumns: string[] = ['contrato', 'cliente', 'correo', 'estrategia', 'mes', 'anual', 'reporte'];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // Variables primer bloque (Búsqueda por contrato)
  contrato: string = '';
  nombreCliente = '';
  estrategia = '';
  searchYear: number | null = null;
  searchMonth: string | null = null;
  searchYears: number[] = []; // Años para búsqueda
  months: string[] = [];

  // Variables para segundo bloque (Generar reportes)
  generateYear: number | null = null;
  generateMonth: string | null = null;
  generateStrategy: string | null = null;
  generateYears: number[] = [];
  monthsStrategy: string[] = [];

  // Variables para tercer bloque (Buscar archivos)
  filesYear: number | null = null;
  filesMonth: string | null = null;
  filesStrategy: string | null = null;
  filesYears: number[] = [];
  monthsFiles: string[] = [];

  // Variables compartidas
  mensajeExito = '';
  mensajeError = '';

  strategies: string[] = [];
  apiUrl = environment.API_URL;
  disponibilidad: { [year: string]: string[] } = {};
  searchFilesButton = 'Buscar';
  sendfiles = 'Enviar';
  anySelected = false;
  lengRegister: number | null = null;
  isLoading = false;
  token = localStorage.getItem('token');
  years: number[] = [];
  userEmail: string = ''
  userPerfil: string = 'VIST'; // o 'ASESOR', 'VIST'

  // Variables para tabla y paginación

  datos: any[] = [];
  paginatedDatos: any[] = [];
  dataSource = new MatTableDataSource<any>();
  allSelected = false;
  filters = {
    contrato: '',
    cliente: '',
    correo: ''
  };


  constructor(
    private http: HttpClient,
    private estrategiasService: EstrategiasService,
    private dialog: MatDialog,
    private router: Router,
    private utilities: Utilities,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeDateOptions();
  }

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.userPerfil = localStorage.getItem('perfil') || '';
    this.loadStrategies();
    this.loadGenerateYears();
    this.loadFilesYears();
    const token = localStorage.getItem('token');
    if (!token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
      return;
    }
  }

  ngAfterViewInit() {
  this.paginator.pageSize = this.paginator.pageSize || 5;
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;
  this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
}

  loadStrategies(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.estrategiasService.getEstrategias(token).subscribe({
        next: (data: string[]) => {
          this.strategies = data;
        },
        error: (error) => {
          console.error(error);
          if (error.error.token === "El token de autenticación ha expirado." ||
            error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al obtener estrategias');
            this.router.navigate(['/']);
          }
        }
      });
    }
  }

  private loadGenerateYears(): void {

    const token = localStorage.getItem('token');
    if (token) {
      const url = `${this.apiUrl}/reportesAlpha/getYearsReports`;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<string[] | null>(url, { headers }).subscribe({
        next: (data: string[] | null) => {
          if (data === null || data.length === 0) {
            this.showDialog('FAILED', 'No hay años disponibles.');
          } else {
            this.generateYears = [...data.map(year => Number(year))];
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          console.error(error);
          if (error.error.token === "El token de autenticación ha expirado." || error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al obtener años');
          }
        }
      });
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
  }



  private loadFilesYears(): void {

    const token = localStorage.getItem('token');
    if (token) {
      const url = `${this.apiUrl}/reportesAlpha/getYearsFiles`;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<string[] | null>(url, { headers }).subscribe({
        next: (data: string[] | null) => {
          if (data === null || data.length === 0) {
            this.showDialog('FAILED', 'No hay años disponibles.');
          } else {
            this.filesYears = [...data.map(year => Number(year))];
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          console.error(error);
          if (error.error.token === "El token de autenticación ha expirado." || error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al obtener años');
          }
        }
      });
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
  }

  private initializeDateOptions(): void {
    this.months = this.utilities.getMonthNames();
    this.monthsStrategy = this.utilities.getMonthNames();
    this.monthsFiles = this.utilities.getMonthNames();
  }

  buscarCliente(): void {
    if (!this.token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
      return;
    }

    if (!this.contrato || !/^\d+$/.test(this.contrato)) {
      this.showDialog('MESSAGE', 'Por favor ingrese un número de contrato válido (solo números).');
      return;
    }

    const url = `${environment.API_URL}/reportesAlpha/buscar`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    const body = { contrato: Number(this.contrato) };


    this.isLoading = true;
    this.http.post(url, body, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status === 'SUCCESS') {
          this.nombreCliente = response.nombreCliente;
          this.estrategia = response.estrategia;
          this.disponibilidad = response.disponibilidad;
          this.searchYears = Object.keys(this.disponibilidad)
            .map(Number)
            .sort((a, b) => b - a);
          this.searchYear = null;
          this.searchMonth = null;
        } else if (response.status === 'FAILED') {
          this.isLoading = false;
          this.showDialog('FAILED', response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showDialog('FAILED', 'Error al buscar cliente.');
      }
    });
  }


  onYearChange(selectedYear: number | null): void {
    if (!selectedYear) {
      this.months = [];
      return;
    }
    this.months = this.disponibilidad[selectedYear.toString()] || [];
  }

  onGenerateYearChange(selectedYear: number | null): void {
    this.generateMonth == null;
    if (!selectedYear) {
      this.monthsStrategy = [];
      return;
    }
    this.loadAvailableMonthsForGeneration(selectedYear);
  }

  onFilesYearChange(selectedYear: number | null): void {
    this.filesMonth == null
    if (!selectedYear) {
      this.monthsFiles = [];
      return;
    }
    this.loadAvailableMonthsForFiles(selectedYear);
  }

  private loadAvailableMonthsForGeneration(year: number): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = `${this.apiUrl}/reportesAlpha/getMonthsForGeneration`;
    const params = { year: year.toString() };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<string[]>(url, { headers, params }).subscribe({
      next: (months) => {
        this.monthsStrategy = months || [];

        if (this.monthsStrategy.length > 0) {
        this.generateMonth = this.monthsStrategy[0];
      } else {
        this.generateMonth = null;
      }
      },
      error: (error) => {
        console.error('Error al cargar meses para generación:', error);
        this.monthsStrategy = [];
      }
    });
  }

  private loadAvailableMonthsForFiles(year: number): void {
  const token = localStorage.getItem('token');
  if (!token) return;

  const url = `${this.apiUrl}/reportesAlpha/getMonthsForFiles`;
  const params = { year: year.toString() };
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.http.get<string[]>(url, { headers, params }).subscribe({
    next: (months) => {
      this.monthsFiles = months || [];

      // ✅ Seleccionar automáticamente el primer mes si existe
      if (this.monthsFiles.length > 0) {
        this.filesMonth = this.monthsFiles[0];
      } else {
        this.filesMonth = null;
      }
    },
    error: (error) => {
      console.error('Error al cargar meses para archivos:', error);
      this.monthsFiles = [];
      this.filesMonth = null;
    }
  });
}



  todosLosCamposLlenos(): boolean {
    return !!this.contrato && !!this.nombreCliente && !!this.searchYear && !!this.searchMonth;
  }

  generarReporte(): void {
    if (!this.contrato || !this.nombreCliente) {
      this.showDialog(
        'MESSAGE',
        'Para generar el reporte, primero ingresa el número de contrato válido, haz clic en "Buscar", selecciona Año y Mes y después en "Generar Reporte".'
      );
      return;
    }

    if (!this.searchYear || !this.searchMonth) {
      this.showDialog(
        'MESSAGE',
        'Selecciona Mes y Año para generar el reporte.'
      );
      return;
    }

    const body = {
      contrato: this.contrato!,
      year: this.searchYear!,
      month: this.obtenerNumeroMes(this.searchMonth),
      userEmail: this.userEmail
    };

    this.isLoading = true;
    const url = `${this.apiUrl}/reportesAlpha/reporte-alpha`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    this.http.post(url, body, { headers }).subscribe({
      next: (response: any) => {
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
            this.showDialog('MESSAGE', 'Estado de respuesta desconocido');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showDialog('MESSAGE', 'Error al enviar archivos.', error.message);
        console.log(error.message);
      }
    });
  }

  uploadFolderPath(): void {
    if (!this.generateYear || !this.generateMonth || !this.generateStrategy) {
      this.showDialog('MESSAGE', 'Por favor seleccione año, mes y estrategia');
      return;
    }

    this.isLoading = true;
    const monthIndex = this.monthsStrategy.indexOf(this.generateMonth) + 1;
    const url = `${this.apiUrl}/reportesAlpha/generar-por-estrategia`;

    const params = {
      year: this.generateYear.toString(),
      month: monthIndex.toString(),
      strategy: this.generateStrategy,
      userEmail: this.userEmail
    };

    const headers = this.token
      ? new HttpHeaders().set('Authorization', `Bearer ${this.token}`)
      : undefined;

    this.http.get<string>(url, { headers, params }).subscribe({
      next: (res) => {
        this.showDialog('SUCCESS', `Reportes generados para estrategia ${this.generateStrategy}`);
      },
      error: (err) => {
        this.showDialog('FAILED', 'Error al generar reportes por estrategia');
      }
    });
  }


  searchFiles() {
    if (!this.filesYear || !this.filesMonth || !this.filesStrategy) {
      this.showDialog('MESSAGE', 'Por favor, seleccione Año, Mes y Estrategia.');
      return;
    }

    this.isLoading = true;
    const monthIndex = this.monthsFiles.indexOf(this.filesMonth) + 1;
    const url = `${this.apiUrl}/dispercion/getReportes`;
    const params = {
      year: this.filesYear.toString(),
      month: monthIndex.toString(),
      strategy: this.filesStrategy
    };

    if (!this.token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<any[]>(url, { headers, params }).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.lengRegister = data.length;

        if (data && data.length > 0) {
          this.datos = data.map(item => ({
            selected: false,
            contrato: item.id.contrato,
            cliente: item.nombreCliente || 'N/A',
            correo: item.email || 'N/A',
            estrategia: item.estrategia || 'N/A',
            mes: this.months[item.id.mes - 1],
            anual: item.id.anual,
            nombrePdf: item.archivoPDF,
            visualizador: 'description',
          }));

          this.dataSource.data = this.datos;
          this.paginator.firstPage();
          this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
          this.paginator.length = this.datos.length;
        } else {
          this.datos = [];
          this.dataSource.data = [];
          this.paginatedDatos = [];
          this.showDialog('MESSAGE', 'No existen registros.');
        }
      },
      error: (error) => {
        this.paginatedDatos = [];
        this.isLoading = false;

        if (error.status === 404 && error.error?.message) {
          this.dataSource.data = [];
          this.showDialog('MESSAGE', error.error.message);
        } else {
          this.dataSource.data = [];
          this.showDialog('FAILED', 'Ocurrió un error al buscar los archivos.');
        }
      }
    });

  }

  downloadPDF(contrato: number, estrategia: string, nombreArchivo: string): void {
  if (!this.filesYear || !this.filesMonth) {
    return;
  }

  this.isLoading = true;
  const monthIndex = this.monthsFiles.indexOf(this.filesMonth) + 1;
  const url = `${this.apiUrl}/reportesAlpha/pdf/${contrato}`;
  const params = {
    year: this.filesYear.toString(),
    month: monthIndex.toString(),
    strategy: estrategia
  };

  const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

  this.http.get(url, { responseType: 'blob', headers, params }).subscribe({
    next: (response: Blob) => {
      this.isLoading = false;
      const blob = new Blob([response], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = nombreArchivo;
      link.click();
      window.URL.revokeObjectURL(link.href); // Limpieza
    },
    error: () => {
      this.isLoading = false;
    }
  });
}


  viewPDF(contrato: number, estrategia: string): void {
    if (!this.filesYear || !this.filesMonth) {
      return;
    }

    this.isLoading = true;
    const monthIndex = this.monthsFiles.indexOf(this.filesMonth) + 1;
    const url = `${this.apiUrl}/reportesAlpha/pdf/${contrato}`;
    const params = {
      year: this.filesYear.toString(),
      month: monthIndex.toString(),
      strategy: estrategia
    };

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    this.http.get(url, { responseType: 'blob', headers, params }).subscribe({
      next: (response: Blob) => {
        this.isLoading = false;
        const blob = new Blob([response], { type: 'application/pdf' });
        const objectUrl = window.URL.createObjectURL(blob);
        window.open(objectUrl);
      },
      error: () => {
        this.isLoading = false;
      }
    });

  }


  onPageChange(event: PageEvent): void {
    this.paginator.pageSize = event.pageSize;
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.paginatedDatos = this.datos.slice(startIndex, endIndex);
  }

  applyFilters() {
    this.dataSource.filter = JSON.stringify(this.filters);
    this.dataSource.filterPredicate = (dato, filtroTexto) => {
      const filtro = JSON.parse(filtroTexto);

      const contratoMatch = !filtro.contrato || dato.contrato.toString().includes(filtro.contrato);
      const clienteMatch = !filtro.cliente || dato.cliente.toLowerCase().includes(filtro.cliente.toLowerCase());
      const correoMatch = !filtro.correo || dato.correo.toLowerCase().includes(filtro.correo.toLowerCase());
      const estrategiaMatch = !filtro.estrategia || dato.estrategia.toLowerCase() === filtro.estrategia.toLowerCase();

      return contratoMatch && clienteMatch && correoMatch && estrategiaMatch;
    };


    if (this.paginator) {
      this.paginator.firstPage();
    }
  }


  clearSelections() {
    this.dataSource.data.forEach(dato => dato.selected = false);
    this.allSelected = false;
    this.anySelected = false;
  }


  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: tipo === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  obtenerNumeroMes(nombreMes: string | null): string {
    if (!nombreMes) return '01';

    const mapaMeses: { [key: string]: string } = {
      'Enero': '01',
      'Febrero': '02',
      'Marzo': '03',
      'Abril': '04',
      'Mayo': '05',
      'Junio': '06',
      'Julio': '07',
      'Agosto': '08',
      'Septiembre': '09',
      'Octubre': '10',
      'Noviembre': '11',
      'Diciembre': '12'
    };

    return mapaMeses[nombreMes] || '01';
  }


  showDialog(title: string, content: string, details?: string[]): void {
    this.isLoading = false;
    const dialogRef = this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
    });
  }

}