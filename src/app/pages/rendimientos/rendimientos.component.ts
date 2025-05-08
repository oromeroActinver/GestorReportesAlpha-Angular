import { ChangeDetectionStrategy, ViewChild, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { provideNativeDateAdapter } from '@angular/material/core';
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

  rendimientosForm: FormGroup;  
  apiUrl = environment.API_URL;
  token = localStorage.getItem('token');
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<any>();
  
  // Datos y configuración
  strategies: any[] = [];
  years: number[] = [];
  selectedStrategy: string | null = null;
  selectedYear: number | null = null;
  isLoading: boolean = false;
  
  // Datos originales y procesados
  rawData: any[] = [];
  groupedData: any[] = [];
  filteredGroupedData: any[] = [];
  displayedGroupedData: any[] = [];
  
  // Estado de expansión
  expandedPortfolios: Set<number> = new Set();
  
  // Filtros
  filters = {
    portafolio: '',
    inicioAlpha: ''
  };
  
  // Ordenamiento
  sorting = {
    column: '',
    direction: 'asc'
  };
 
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
    
    // Generar años disponibles
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 10; year--) {
      this.years.push(year);
    }
  }
 
  ngOnInit(): void {
    this.loadStrategies();
  }
 
  loadStrategies(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.estrategiasService.getNewEstrategias(token).subscribe({
        next: (data: string[]) => {
          this.strategies = data;
        },
        error: (error) => {
          console.error(error);
          if (error.error.token === "El token de autenticación ha expirado." || error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al obtener estrategias');
          }
        }
      });
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
  }
 
  searchRendimientos(): void {
    if (this.selectedYear && this.selectedStrategy) {
      this.isLoading = true;
      const url = `${this.apiUrl}/Rend/historico`;
      const params = {
        estrategia: this.selectedStrategy,
        anual: this.selectedYear.toString()
      };
 
      if (this.token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
        
        this.http.get<any[]>(url, { headers, params }).subscribe({
          next: (data) => {
            this.isLoading = false;
            this.processResponseData(data);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error:', error);
            this.showDialog('FAILED', 'Ocurrió un error al buscar los rendimientos.');
          }
        });
      } else {
        this.showDialog('FAILED', 'Usuario no autenticado.');
      }
    } else {
      this.showDialog('MESSAGE', 'Por favor, seleccione Año y Estrategia.');
    }
  }
 
  private processResponseData(data: any[]): void {
    if (data && data.length > 0) {
      this.rawData = data.map(item => this.transformDataItem(item));
      this.groupedData = this.groupByPortfolio(this.rawData);
      this.applyFilters(); // Aplica filtros iniciales
    } else {
      this.handleNoData();
    }
  }
 
  private transformDataItem(item: any): any {
    return {
      portafolio: item.cvePortafolio,
      concepto: item.concepto,
      estrategia: item.nomEstrategia,
      inicioAlpha: item.fechaInvAlpha || 'N/A',
      anioAnterior: item.anoAnt || 0,
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
    };
  }
 
  private groupByPortfolio(data: any[]): any[] {
    const groupedMap = new Map<number, any>();
    
    data.forEach(item => {
      if (!groupedMap.has(item.portafolio)) {
        groupedMap.set(item.portafolio, {
          portafolio: item.portafolio,
          estrategia: item.estrategia,
          inicioAlpha: item.inicioAlpha,
          activoInicio: item.activoInicio,
          activoFin: item.activoFin,
          rendimiento: item.concepto === 'Rendimiento' ? item : null,
          benchmark: item.concepto === 'Benchmark' ? item : null,
          isExpanded: false
        });
      } else {
        const existing = groupedMap.get(item.portafolio);
        if (item.concepto === 'Rendimiento') {
          existing.rendimiento = item;
        } else if (item.concepto === 'Benchmark') {
          existing.benchmark = item;
        }
      }
    });
    
    return Array.from(groupedMap.values());
  }
 
  applyFilters(): void {
    // Aplicar filtros a los datos agrupados
    this.filteredGroupedData = this.groupedData.filter(grupo => {
      const matchesPortfolio = !this.filters.portafolio || 
        grupo.portafolio.toString().toLowerCase().includes(this.filters.portafolio.toLowerCase());
      
      const matchesAlpha = !this.filters.inicioAlpha || 
        (grupo.inicioAlpha && grupo.inicioAlpha.toString().toLowerCase().includes(this.filters.inicioAlpha.toLowerCase()));
      
      return matchesPortfolio && matchesAlpha;
    });
 
    // Aplicar ordenamiento
    if (this.sorting.column) {
      this.filteredGroupedData.sort((a, b) => {
        // Para ordenar por columnas específicas
        let valueA, valueB;
        
        if (this.sorting.column === 'portafolio' || this.sorting.column === 'estrategia' || this.sorting.column === 'inicioAlpha') {
          valueA = a[this.sorting.column];
          valueB = b[this.sorting.column];
        } else {
          // Para columnas de rendimiento/benchmark
          valueA = a.rendimiento ? a.rendimiento[this.sorting.column] : null;
          valueB = b.rendimiento ? b.rendimiento[this.sorting.column] : null;
        }
 
        if (valueA == null) return 1;
        if (valueB == null) return -1;
        
        const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return this.sorting.direction === 'asc' ? comparison : -comparison;
      });
    }
 
    // Actualizar paginación
    this.paginator.length = this.filteredGroupedData.length;
    this.updatePaginatedData();
  }
 
  sortBy(column: string): void {
    if (this.sorting.column === column) {
      this.sorting.direction = this.sorting.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sorting.column = column;
      this.sorting.direction = 'asc';
    }
    this.applyFilters();
  }
 
  onPageChange(event: PageEvent): void {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.updatePaginatedData();
  }
 
  private updatePaginatedData(): void {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.displayedGroupedData = this.filteredGroupedData.slice(startIndex, endIndex);
  }
 
  togglePortfolio(portafolio: number): void {
    const item = this.filteredGroupedData.find(d => d.portafolio === portafolio);
    if (item) {
      item.isExpanded = !item.isExpanded;
    }
  }
 
  private handleNoData(): void {
    this.rawData = [];
    this.groupedData = [];
    this.filteredGroupedData = [];
    this.displayedGroupedData = [];
    this.paginator.length = 0;
    this.showDialog('MESSAGE', 'No existen DATOS de rendimientos.');
  }
 
  // Resto de métodos (showDialog, openRendimientosDialog, etc.) permanecen igual
  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }
 
  openRendimientosDialog() {
    this.dialog.open(RendimientosDialogComponent, {
      width: '900px',
      height: '300px',
      panelClass: 'custom-dialog',  
    });
  }
 
  ngAfterViewInit() {
    this.paginator.pageSize = this.paginator.pageSize || 10;
    this.paginator.pageSizeOptions = [5, 10, 20, 50, 100, 200];
    this.dataSource.paginator = this.paginator;
  }
}