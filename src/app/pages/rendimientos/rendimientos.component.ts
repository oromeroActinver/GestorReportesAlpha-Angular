import { ChangeDetectionStrategy, ViewChild, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import {provideNativeDateAdapter} from '@angular/material/core';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { EstrategiasService } from '../dispercion/EstrategiasService';
import { MatTableDataSource } from '@angular/material/table';
import { RendimientosDialogComponent } from '../rendimientos-dialog/rendimientos-dialog.component';


@Component({
  selector: 'app-rendimientos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatPaginatorModule,
    FormsModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule
  ],
  templateUrl: './rendimientos.component.html',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./rendimientos.component.css']
})

export class RendimientosComponent {
  apiUrl = environment.API_URL;
  token = localStorage.getItem('token');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>();
  strategies: string[] = [];
  paginatedDatos: any[] = [];
  selectedStrategy: string | null = null;
  selectedYear: number | null = null;
  years: number[] = [];
  rendimientosForm: FormGroup;
  isLoading: boolean = false;
  datos: any[] = [];
  portafolio: string | null = null;

  constructor(
    private fb: FormBuilder,
    private estrategiasService: EstrategiasService,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient
  ) {
    this.rendimientosForm = this.fb.group({
      fechaInicioMensual: [''],
      fechaFinMensual: [''],
      fechaInicioAnual: [''],
      fechaFinAnual: ['']
    });
    const currentYear = new Date().getFullYear();
    const pastYears = currentYear - 10;
    for (let year = currentYear; year >= pastYears; year--) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
   const token = localStorage.getItem('token');

    if (token) {
      this.estrategiasService.getEstrategias(token).subscribe(
        (data: string[]) => {
          this.strategies = data;
        },
        error => {
          console.error(error);
          if (error.error.token === "El token de autenticación ha expirado." || error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al obtener estrategias');
          }
        }
      );
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
  }

  searchRendimientos() {
    if (this.selectedYear && this.selectedStrategy) {
      this.isLoading = true;
      const url = '/api/a2k/rendimientos';
      const params = {
        year: this.selectedYear.toString(),
        strategy: this.selectedStrategy
      };
  
      if (this.token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
        this.http.post<any[]>(url, null, { headers, params })
          .subscribe(data => {
            this.isLoading = false;
            if (data && data.length > 0) {
              this.datos = data.map(item => ({
                portafolio: item.portafolio,
                inicioAlpha: item.inicioAlpha,
                anioAnterior: item.anioAnterior,
                desdeInicio: item.desdeInicio,
                enero: item.enero,
                febrero: item.febrero,
                marzo: item.marzo,
                abril: item.abril,
                mayo: item.mayo,
                junio: item.junio,
                julio: item.julio,
                agosto: item.agosto,
                septiembre: item.septiembre,
                octubre: item.octubre,
                noviembre: item.noviembre,
                diciembre: item.diciembre,
                enelAnio: item.enelAnio,
                activoInicio: item.activoInicio,
                activoFin: item.activoFin,
                estrategia: item.estrategia
              }));
              this.dataSource.data = this.datos;
              this.paginator.firstPage();
              this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
              this.paginator.length = this.datos.length;
            } else {
              this.datos = [];
              this.dataSource.data = [];
              this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
              this.showDialog('MESSAGE', 'No existen DATOS de rendimientos.');
            }
          }, error => {
            this.isLoading = false;
            this.showDialog('FAILED', 'Ocurrió un error al buscar los rendimientos.');
          });
      } else {
        this.showDialog('FAILED', 'Usuario no autenticado.');
      }
    } else {
      this.showDialog('MESSAGE', 'Por favor, seleccione Año y Estrategia.');
    }
  }

/* Metodo para la generacion de reportes Alpha es solo una prueba  */
generateReportAlpha(): void {
  this.isLoading = true; // Muestra el indicador de carga
  const url = '/api/a2k/reportAlpha';

  if (this.token) {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    
    this.http.post<string>(url, null, { headers }).subscribe(
      (response) => {
        // Mostrar el mensaje de éxito del backend
        this.isLoading = false;
        this.showDialog('SUCCESS', response);
      },
      (error) => {
        // Manejo de errores
        this.isLoading = false;
        console.error('Error al generar el reporte:', error);
        this.showDialog('FAILED', 'Error al generar el reporte. Intente de nuevo más tarde.');
      },
      () => {
        // Asegúrate de ocultar el indicador de carga
        this.isLoading = false;
      }
    );
  } else {
    this.isLoading = false; // Asegúrate de ocultar el indicador si no hay token
    this.showDialog('FAILED', 'Usuario no autenticado.');
  }
  this.isLoading = false;
}

  

  openRendimientosDialog() {
    this.dialog.open(RendimientosDialogComponent, {
      width: '900px',
      height: '300px',
      panelClass: 'custom-dialog',  
    });
  }

  ngAfterViewInit() {
    this.paginator.pageSize = this.paginator.pageSize || 5;
    this.dataSource.paginator = this.paginator;
    this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
}

showDialog(title: string, content: string, details?: string[]): void {
  this.dialog.open(MessageDetailsDialogComponent, {
    width: '300px',
    data: { messageTitle: title, messageContent: content, details: details }
  });
}

onPageChange(event: PageEvent): void {
  this.paginator.pageSize = event.pageSize;
  const startIndex = event.pageIndex * event.pageSize;
  const endIndex = startIndex + event.pageSize;
  this.paginatedDatos = this.datos.slice(startIndex, endIndex);
}

filters = {
  portafolio: '',
  inicioAlpha: ''
};
sorting = {
  column: '',
  direction: 'asc' 
};

applyFilters() {
  this.paginatedDatos = this.datos.filter(dato => {
    return (
      (!this.filters.portafolio || dato.portafolio.toString().toLowerCase().includes(this.filters.portafolio.toLowerCase())) &&
      (!this.filters.inicioAlpha || dato.inicioAlpha.toString().toLowerCase().includes(this.filters.inicioAlpha.toLowerCase()))
    );
  });

  this.paginator.length = this.paginatedDatos.length;
  const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  this.paginatedDatos = this.paginatedDatos.slice(startIndex, startIndex + this.paginator.pageSize);
}

sortBy(column: string) {
  if (this.sorting.column === column) {
    this.sorting.direction = this.sorting.direction === 'asc' ? 'desc' : 'asc';
  } else {
    this.sorting.column = column;
    this.sorting.direction = 'asc';
  }

  const directionMultiplier = this.sorting.direction === 'asc' ? 1 : -1;
  this.paginatedDatos.sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];

    if (valueA < valueB) return -1 * directionMultiplier;
    if (valueA > valueB) return 1 * directionMultiplier;
    return 0;
  });
}



  
}