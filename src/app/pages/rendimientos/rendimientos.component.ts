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
  strategies: any[] = []; // Cambiado a any[] para manejar objetos de estrategia
  paginatedDatos: any[] = [];
  selectedStrategy: string | null = null;
  selectedYear: number | null = null;
  years: number[] = [];
  rendimientosForm: FormGroup;
  isLoading: boolean = false;
  datos: any[] = [];
  portafolio: string | null = null;

  // Nuevas propiedades para el benchmark
  showBenchmark: boolean = false;
  benchmarkData: any[] = [];
  combinedData: any[] = [];

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
      this.estrategiasService.getNewEstrategias(token).subscribe(
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

  /*ngOnInit(): void {
    const token = localStorage.getItem('token');
  
     if (token) {
       this.estrategiasService.getNewEstrategias(token).subscribe(
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

     const currentYear = new Date().getFullYear();
    const pastYears = currentYear - 10;
    for (let year = currentYear; year >= pastYears; year--) {
      this.years.push(year);
    }
   }*/

  searchRendimientos() {
    if (this.selectedYear && this.selectedStrategy) {
      this.isLoading = true;
      const url = `${this.apiUrl}/Rend/historico`;
      const params = {
        estrategia: this.selectedStrategy,
        anual: this.selectedYear.toString()
      };

      if (this.token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
        this.http.get<any[]>(url, { headers, params })
          .subscribe(data => {
            this.isLoading = false;
            if (data && data.length > 0) {
              // Separar datos de rendimiento y benchmark
              this.datos = data.map(item => ({
                portafolio: item.cvePortafolio,
                concepto: item.concepto,
                estrategia: item.nomEstrategia,
                inicioAlpha: item.fechaInvAlpha || 'N/A',
                anioAnterior: item.anoAnt || 0,
                desdeInicio: item.desdeInicio || 0,
                enero: item.enero || 0,
                febrero: item.febrero || 0,
                marzo: item.marzo || 0,
                abril: item.abril || 0,
                mayo: item.mayo || 0,
                junio: item.junio || 0,
                julio: item.julio || 0,
                agosto: item.agosto || 0,
                septiembre: item.septiembre || 0,
                octubre: item.octubre || 0,
                noviembre: item.noviembre || 0,
                diciembre: item.diciembre || 0,
                enelAnio: item.enAno || 0,
                activoInicio: item.activoIni || 0,
                activoFin: item.activo || 0
              }));
              this.combinedData = [...this.datos];
              this.dataSource.data = this.combinedData;
              this.paginator.firstPage();
              this.paginatedDatos = this.combinedData.slice(0, this.paginator.pageSize);
              this.paginator.length = this.combinedData.length;
            } else {
              this.datos = [];
              this.benchmarkData = [];
              this.combinedData = [];
              this.dataSource.data = [];
              this.paginatedDatos = [];
              this.showDialog('MESSAGE', 'No existen DATOS de rendimientos.');
            }
          }, error => {
            this.isLoading = false;
            console.error('Error:', error);
            this.showDialog('FAILED', 'Ocurrió un error al buscar los rendimientos.');
          });
      } else {
        this.showDialog('FAILED', 'Usuario no autenticado.');
      }
    } else {
      this.showDialog('MESSAGE', 'Por favor, seleccione Año y Estrategia.');
    }
  }

  toggleBenchmark() {
    this.showBenchmark = !this.showBenchmark;
    if (this.showBenchmark) {
      this.combinedData = [...this.datos, ...this.benchmarkData];
    } else {
      this.combinedData = [...this.datos];
    }
    this.dataSource.data = this.combinedData;
    this.paginator.firstPage();
    this.paginatedDatos = this.combinedData.slice(0, this.paginator.pageSize);
    this.paginator.length = this.combinedData.length;
  }

  // Resto de los métodos permanecen igual...
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
    this.paginatedDatos = this.combinedData.slice(startIndex, endIndex);
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
    this.paginatedDatos = this.combinedData.filter(dato => {
      return (
        (!this.filters.portafolio || dato.portafolio.toString().toLowerCase().includes(this.filters.portafolio.toLowerCase())) &&
        (!this.filters.inicioAlpha || (dato.inicioAlpha && dato.inicioAlpha.toString().toLowerCase().includes(this.filters.inicioAlpha.toLowerCase())))
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
