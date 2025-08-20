import { Component, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'; //import { HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table'; // ✅ Importar módulo de tabla
import { MatFormFieldModule } from '@angular/material/form-field'; // ✅ Campo de mes
import { MatInputModule } from '@angular/material/input'; // ✅ Input
import { MatIconModule } from '@angular/material/icon'; // ✅ Icono de búsqueda
import { FormsModule } from '@angular/forms'; // ✅ Para ngModel
import { MatButtonModule } from '@angular/material/button'; // ✅ Botón de búsqueda
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';


@Component({
  selector: 'app-benchmark',
  standalone: true,
  imports: [MatProgressSpinnerModule, CommonModule,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './benchmark.component.html',
  styleUrl: './benchmark.component.css'
})
export class BenchmarkComponent {

  @ViewChild('dialogEliminarBenchmark') dialogEliminarBenchmark!: TemplateRef<any>;
  @ViewChild('dialogEditarBenchmark') dialogEditarBenchmark!: TemplateRef<any>;
  @ViewChild('dialogCargarBenchmark') dialogCargarBenchmark!: TemplateRef<any>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  mesSeleccionado: string = '';
  searchMonth: string | null = null;
  displayedColumns: string[] = ['fecha', 'indiceBench', 'benchmark', 'usuario', 'fechaModificacion', 'opciones'];
  displayedColumnsFilters: string[] = this.displayedColumns;
  columnFilters: { [key: string]: string } = {};
  currentFilters: { [key: string]: string } = {};
  dataSource = new MatTableDataSource<any>([]);
  paginatedDatos: any[] = [];
  datos: any[] = [];
  apiUrl = environment.API_URL;
  isLoading: boolean = false;
  selectedFile: File | null = null;
  modoDialogo: 'editar' | 'eliminar' | null = null;
  elementoSeleccionado: any = null;
  userPerfil: string = 'VIST'; // o 'ASESOR', 'VIST'
  dialogRef!: MatDialogRef<any>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.sort = this.sort;
    this.userPerfil = localStorage.getItem('perfil') || '';

    // Definir columnas base
    this.displayedColumns = [
      'fecha',
      'indiceBench',
      'benchmark',
      'usuario',
      'fechaModificacion'
    ];

    // Agregar columna "opciones" solo si el usuario es ADMIN
    if (this.userPerfil === 'ADMIN') {
      this.displayedColumns.push('opciones');
    }

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const filters = JSON.parse(filter);
      return Object.keys(filters).every((col) => {
        const searchValue = filters[col].toLowerCase();
        return data[col]?.toString().toLowerCase().includes(searchValue);
      });
    };
  }


  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  consultarBenchmarkPorMes(): void {
    const formatoMesRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;

    if (!this.mesSeleccionado || this.mesSeleccionado.trim() === '') {
      this.showDialog('FAILED', 'Por favor ingresa un mes en el formato MM/YYYY.');
      return;
    }

    if (!formatoMesRegex.test(this.mesSeleccionado)) {
      this.showDialog('FAILED', 'El formato del mes es incorrecto. Usa MM/YYYY (por ejemplo, 08/2025).');
      return;
    }

    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.apiUrl}/Bench/consultar?mes=${this.mesSeleccionado}`;

    this.http.get<any[]>(url, { headers }).subscribe(
      data => {
        this.isLoading = false;
        this.dataSource.data = data;
        if (data.length === 0) {
          this.showDialog('MESSAGE', 'No existen registros');
        }
      },
      error => {
        this.isLoading = false;
        this.showDialog('FAILED', 'Error al consultar datos: ' + error.message);
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file ? file : null;
  }

  uploadFiles(): void {
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

  confirmarEdicion() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const { fecha, cveIndiceBench, benchmark } = this.elementoSeleccionado;

    const params = new HttpParams()
      .set('fecha', fecha.toString())
      .set('cveIndiceBench', cveIndiceBench.toString())
      .set('benchmark', benchmark.toString());

    this.http.put(`${this.apiUrl}/Bench/actualizar`, null, { headers, params }).subscribe(
      (response: any) => {
        this.isLoading = false;
        switch (response.status) {
          case 'SUCCESS':
            this.dialog.closeAll();
            this.showDialog('SUCCESS', response.message, response.details);
            this.consultarBenchmarkPorMes();
            break;
          case 'FAILED':
            this.dialog.closeAll();
            this.showDialog('FAILED', response.message, response.details);
            break;
          default:
            this.dialog.closeAll();
            this.showDialog('FAILED', 'Estado de respuesta desconocido');
        }
        this.modoDialogo = null;

      },
      error => {
        this.isLoading = false;
        this.dialog.closeAll();
        this.showDialog('FAILED', 'Error al subir el archivo: ' + error.message);
        this.modoDialogo = null;
        this.dialogRef.close();
      }
    );
  }

  confirmarEliminacion() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const { fecha, cveIndiceBench, benchmark } = this.elementoSeleccionado;

    const params = new HttpParams()
      .set('fecha', fecha.toString())
      .set('cveIndiceBench', cveIndiceBench.toString())
      .set('benchmark', benchmark.toString());

    this.http.delete(`${this.apiUrl}/Bench/eliminar`, { headers, params }).subscribe(
      (response: any) => {
        this.isLoading = false;
        switch (response.status) {
          case 'SUCCESS':
            this.dialog.closeAll();
            this.showDialog('SUCCESS', response.message, response.details);
            this.consultarBenchmarkPorMes();
            break;
          case 'FAILED':
            this.dialog.closeAll();
            this.showDialog('FAILED', response.message, response.details);
            break;
          default:
            this.dialog.closeAll();
            this.showDialog('FAILED', 'Estado de respuesta desconocido');
        }
        this.modoDialogo = null;
      },
      error => {
        this.isLoading = false;
        this.dialog.closeAll();
        this.showDialog('FAILED', 'Error al subir el archivo: ' + error.message);
        this.modoDialogo = null;
      }
    );
  }

  clearSelectedFiles(): void {
    this.selectedFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  applyColumnFilter(column: string, value: string) {
    this.columnFilters[column] = value.trim().toLowerCase();
    this.dataSource.filter = JSON.stringify(this.columnFilters); // dispara el filtro
  }

  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

  abrirDialogCargarBenchmark(): void {
    this.dialog.open(this.dialogCargarBenchmark, {
      width: '500px'
    });
  }

  editarElemento(element: any) {
    this.modoDialogo = 'editar';
    this.elementoSeleccionado = { ...element }; // Copia para edición
    this.dialog.open(this.dialogEditarBenchmark)
  }

  eliminarElemento(element: any) {
    this.modoDialogo = 'eliminar';
    this.elementoSeleccionado = element;

    // Abrir el diálogo usando el ng-template
    this.dialog.open(this.dialogEliminarBenchmark);
  }

  cancelarDialogo() {
    this.modoDialogo = null;
    this.elementoSeleccionado = null;
    this.dialog.closeAll(); // Cierra cualquier diálogo abierto
  }


}
