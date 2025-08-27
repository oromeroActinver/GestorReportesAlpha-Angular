import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Utilities } from '../../services/tempUtilities';
import { EstrategiasService } from '../../services/EstrategiasService';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { TemplateRef } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';



@Component({
  selector: 'app-dispercion-alpha',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatPaginatorModule, MatTooltipModule, MatCheckboxModule, MatTableModule, MatSortModule,
    MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './dispercion-alpha.component.html',
  styleUrl: './dispercion-alpha.component.css'
})
export class DispercionAlphaComponent {


  displayedColumns: string[] = ['select', 'contrato', 'cliente', 'correo', 'estrategia', 'mes', 'anual', 'reporte'];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
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

  selectedYear: number | null = null;
  selectedMonth: string | null = null;
  selectedStrategy: string | null = null;
  pdfSrc: string | null = null;
  mes: number | null = null;
  anual: number | null = null;
  datoEditando: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  datos: any[] = [];
  paginatedDatos: any[] = [];
  dataSource = new MatTableDataSource<any>();
  allSelected: boolean = false;
  userPerfil: string = 'VIST'; // o 'ASESOR', 'VIST'
  userEmail = localStorage.getItem('userEmail') || '';

  // Variables para controlar el diálogo
  showConfirmation = false;
  alreadySentContracts: any[] = [];
  selectedFilesBackup: any[] = [];

  // Variables para tabla y paginación
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
    const currentYear = new Date().getFullYear();
    this.months = utilities.getMonthNames();
    const pastYears = currentYear - 10;
    for (let year = currentYear; year >= pastYears; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.loadStrategies();
    this.loadGenerateYears();
    this.loadFilesYears();
    const token = localStorage.getItem('token');
    this.userPerfil = localStorage.getItem('perfil') || '';
    if (!token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
      return;
    }

    this.displayedColumns = ['select', 'contrato', 'cliente', 'correo', 'estrategia', 'mes', 'anual', 'reporte'];
    if (this.userPerfil === 'ADMIN') {
      this.displayedColumns.push('estatus');
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
      },
      error: (error) => {
        console.error('Error al cargar meses para archivos:', error);
        this.monthsFiles = [];
      }
    });
  }


  todosLosCamposLlenos(): boolean {
    return !!this.contrato && !!this.nombreCliente && !!this.searchYear && !!this.searchMonth;
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
          this.datos = data.map(item => {
            const fechaOriginal = item.fechaEnvio ? new Date(item.fechaEnvio) : null;
            const fechaFormateada = fechaOriginal
              ? `${fechaOriginal.getDate().toString().padStart(2, '0')}-${(fechaOriginal.getMonth() + 1).toString().padStart(2, '0')}-${fechaOriginal.getFullYear()} ${fechaOriginal.getHours().toString().padStart(2, '0')}:${fechaOriginal.getMinutes().toString().padStart(2, '0')}:${fechaOriginal.getSeconds().toString().padStart(2, '0')}`
              : 'PROCESS';

            return {
              selected: false,
              contrato: item.id.contrato,
              cliente: item.nombreCliente || 'N/A',
              correo: item.email || 'N/A',
              estrategia: item.estrategia || 'N/A',
              mes: this.months[item.id.mes - 1],
              anual: item.id.anual,
              nombrePdf: item.archivoPDF,
              estatus: item.estatus || 'PROCESS',
              descripcion: item.descripcion,
              fechaEnvio: fechaFormateada,
              visualizador: 'description',
            };
          });


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

  updateAnySelected() {
    this.anySelected = this.datos.some(dato => dato.selected);
  }

  sendFiles() {
    if (!this.anySelected) {
      this.showDialog('MESSAGE', 'No hay archivos seleccionados para enviar.');
      return;
    }

    this.isLoading = true;
    const selectedFiles = this.datos
      .filter(dato => dato.selected)
      .map(dato => ({
        contrato: dato.contrato,
        mes: this.months.findIndex(m => m.toLowerCase().trim() === dato.mes.toLowerCase().trim()) + 1,
        anual: dato.anual,
        estatus: dato.estatus,
        nombreCliente: dato.nombreCliente
      }));

    // Validar si hay contratos ya enviados
    const alreadySentContracts = selectedFiles.filter(file =>
      file.estatus && file.estatus.includes('Reporte Enviado')
    );

    // Si hay contratos ya enviados, mostrar diálogo de confirmación
    if (alreadySentContracts.length > 0) {
      this.isLoading = false;
      this.alreadySentContracts = alreadySentContracts;
      this.selectedFilesBackup = selectedFiles;
      this.showConfirmation = true;
      return;
    }

    // Si no hay contratos ya enviados, proceder con el envío normal
    this.executeSendFiles(selectedFiles);
  }

  // Método para confirmar el reenvío
  confirmResend() {
    this.showConfirmation = false;
    this.executeSendFiles(this.selectedFilesBackup);
  }

  // Método para cancelar el reenvío
  cancelResend() {
    this.showConfirmation = false;
    // Deseleccionar los contratos ya enviados
    this.datos.forEach(dato => {
      if (this.alreadySentContracts.some(c => c.contrato === dato.contrato)) {
        dato.selected = false;
      }
    });
    this.anySelected = this.datos.some(dato => dato.selected);
    //this.showDialog('MESSAGE', 'Se han deseleccionado los contratos ya enviados.');
  }

  // Método para ejecutar el envío de archivos
  executeSendFiles(selectedFiles: any[]) {
    this.isLoading = true;
    const url = `${this.apiUrl}/dispercion/reportes`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    // Preparar datos para enviar (sin información adicional)
    const filesToSend = selectedFiles.map(file => ({
      contrato: file.contrato,
      mes: file.mes,
      anual: file.anual,
      userEmail: this.userEmail
    }));

    this.http.post(url, filesToSend, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.anySelected = false;

        switch (response.status) {
          case 'SUCCESS':
            this.showDialog('SUCCESS', response.message, response.details);
            this.clearSelections();
            this.searchFiles();
            break;
          case 'FAILED':
            this.showDialog('FAILED', response.message, response.details);
            this.clearSelections();
            this.searchFiles();
            break;
          case 'PARTIAL_SUCCESS':
            this.showDialog('PARTIAL SUCCESS', response.message, response.details);
            this.clearSelections();
            this.searchFiles();
            break;
          default:
            this.showDialog('MESSAGE', 'Estado de respuesta desconocido');
            this.searchFiles();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.searchFiles();
        this.showDialog('MESSAGE', 'Error al enviar archivos.', error.message);
        console.log(error.message);
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

  toggleSelectAll(event: any) {
    const checked = event.checked ?? event.target?.checked;
    this.allSelected = checked;

    this.dataSource.data.forEach(dato => dato.selected = checked);
    this.updateAnySelected();
  }

  clearSelections() {
    this.dataSource.data.forEach(dato => dato.selected = false);
    this.allSelected = false;
    this.anySelected = false;
  }

  openEstatus(dato: any): void {
    if (!dato.estatus || dato.estatus === 'null' || dato.estatus.trim() === '') {
      this.showDialog('Estatus', 'Sin Estatus');
    } else {
      {
        let estado: string[] = [dato.descripcion];
        if (!dato.fechaEnvio || dato.fechaEnvio === 'null' || dato.fechaEnvio.trim() === '') {
          estado.push('Sin fecha de Envio');
        } else {
          estado.push(dato.fechaEnvio);
        }
        this.showDialog('Estatus', dato.estatus, estado);
      }

    }
  }

  editarReporte(dato: any): void {
    this.datoEditando = { ...dato }; // Copia para editar sin afectar el original
    this.dialog.open(this.dialogTemplate, {
      data: this.datoEditando
    });
  }

  guardarCambios(data: any): void {
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(data.correo)) {
      this.showDialog('FAILED', 'Correo inválido Por favor ingresa un correo válido.',);
      return;
    }

    this.isLoading = true;
    const mesInt = this.months.findIndex(m => m.toLowerCase().trim() === data.mes.toLowerCase().trim()) + 1;
    const mesStr = mesInt.toString().padStart(2, '0');

    const payload = {
      contrato: String(data.contrato),
      anual: String(data.anual),
      mes: mesStr,
      cliente: data.cliente,
      correo: data.correo,
      usuario: this.userEmail
    };

    const url = `${this.apiUrl}/dispercion/editar-cliente`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    this.http.post(url, payload, { headers }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        switch (response.status) {
          case 'SUCCESS':
            this.showDialog('SUCCESS', response.message, response.details);
            this.actualizarTabla(data);
            break;
          case 'FAILED':
            this.showDialog('FAILED', response.message, response.details);
            break;
          case 'PARTIAL_SUCCESS':
            this.showDialog('PARTIAL SUCCESS', response.message, response.details);
            this.actualizarTabla(data);
            break;
          default:
            this.showDialog('MESSAGE', 'Estado de respuesta desconocido');
        }
        this.dialog.closeAll();
      },
      error: (error) => {
        this.isLoading = false;
        this.showDialog('MESSAGE', 'Error al guardar cambios.', error.message);
        console.error(error);
      }
    });
  }

  actualizarTabla(data: any): void {
    const index = this.dataSource.data.findIndex(d => d.contrato === data.contrato);
    if (index !== -1) {
      this.dataSource.data[index].cliente = data.cliente;
      this.dataSource.data[index].correo = data.correo;
      this.dataSource._updateChangeSubscription(); // Refresca la tabla
    }
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
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }
}
