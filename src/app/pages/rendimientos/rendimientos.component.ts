import { ChangeDetectionStrategy, ViewChild, Component, ChangeDetectorRef } from '@angular/core';
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

  strategies: any[] = [];
  years: number[] = [];
  selectedStrategy: string | null = null;
  selectedYear: number | null = null;
  isLoading: boolean = false;
  rawData: any[] = [];
  groupedData: any[] = [];
  filteredGroupedData: any[] = [];
  displayedGroupedData: any[] = [];
  expandedPortfolios: Set<number> = new Set();
  allExpanded: boolean = false;

  filters = {
    portafolio: '',
    inicioAlpha: '',
    anioAnterior: '',
    enero: '',
    febrero: '',
    marzo: '',
    abril: '',
    mayo: '',
    junio: '',
    julio: '',
    agosto: '',
    septiembre: '',
    octubre: '',
    noviembre: '',
    diciembre: '',
    enelAnio: '',
    activoInicio: '',
    activoFin: ''
  };

  sorting = {
    column: '',
    direction: 'asc'
  };

  constructor(
    private fb: FormBuilder,
    private estrategiasService: EstrategiasService,
    private dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.rendimientosForm = this.fb.group({
      fechaInicioMensual: [''],
      fechaFinMensual: [''],
      fechaInicioAnual: [''],
      fechaFinAnual: ['']
    });
  }

  ngOnInit(): void {
    this.loadYears();
    this.loadStrategies();
  }

  loadStrategies(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.estrategiasService.getNewEstrategias(token).subscribe({
        next: (data: string[]) => {
          this.strategies = [...data];
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(error);
          if (error.error.token === "El token de autenticación ha expirado." || error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al obtener estrategias');
            this.router.navigate(['/']);
          }
        }
      });
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
  }


  loadYears(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const url = `${this.apiUrl}/Rend/getYears`;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get<string[] | null>(url, { headers }).subscribe({
        next: (data: string[] | null) => {
          if (data === null || data.length === 0) {
            this.showDialog('FAILED', 'No hay años disponibles.');
          } else {
            this.years = [...data.map(year => Number(year))];
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

  searchRendimientos(): void {
    if (this.selectedYear && this.selectedStrategy) {
      this.resetFiltersAndSorting();

      this.isLoading = true;
      const url = `${this.apiUrl}/Rend/getRendimientos`;
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
            this.resetPaginator();
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
    this.paginator._changePageSize(20);
  }

  private resetPaginator(): void {
    if (this.paginator) {
      this.paginator.firstPage();
      this.paginator.length = this.filteredGroupedData.length;
    }
  }

  private processResponseData(data: any[]): void {
    if (data && data.length > 0) {
      this.rawData = data.map(item => this.transformDataItem(item));
      this.groupedData = this.groupByPortfolio(this.rawData);
      this.applyFilters();
    } else {
      this.handleNoData();
    }
  }

  private getValueOrEmpty(value: any): any {
    return value !== null && value !== undefined ? value : '';
  }

  private transformDataItem(item: any): any {
    return {
      portafolio: this.getValueOrEmpty(item.cvePortafolio),
      concepto: this.getValueOrEmpty(item.concepto),
      estrategia: this.getValueOrEmpty(item.nomEstrategia),
      inicioAlpha: this.getValueOrEmpty(item.fechaInvAlpha),
      anioAnterior: this.getValueOrEmpty(item.anoAnt),
      enero: this.getValueOrEmpty(item.enero),
      febrero: this.getValueOrEmpty(item.febrero),
      marzo: this.getValueOrEmpty(item.marzo),
      abril: this.getValueOrEmpty(item.abril),
      mayo: this.getValueOrEmpty(item.mayo),
      junio: this.getValueOrEmpty(item.junio),
      julio: this.getValueOrEmpty(item.julio),
      agosto: this.getValueOrEmpty(item.agosto),
      septiembre: this.getValueOrEmpty(item.septiembre),
      octubre: this.getValueOrEmpty(item.octubre),
      noviembre: this.getValueOrEmpty(item.noviembre),
      diciembre: this.getValueOrEmpty(item.diciembre),
      enelAnio: this.getValueOrEmpty(item.enAno),
      activoInicio: this.getValueOrEmpty(item.activoIni),
      activoFin: this.getValueOrEmpty(item.activo)
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
    this.filteredGroupedData = this.groupedData.filter(grupo => {
      const matchesPortfolio = !this.filters.portafolio ||
        grupo.portafolio.toString().toLowerCase().includes(this.filters.portafolio.toLowerCase());

      const matchesAlpha = !this.filters.inicioAlpha ||
        (grupo.inicioAlpha && grupo.inicioAlpha.toString().toLowerCase().includes(this.filters.inicioAlpha.toLowerCase()));

      return matchesPortfolio && matchesAlpha;
    });

    if (this.sorting.column) {
      this.filteredGroupedData.sort((a, b) => {
        let valueA: any, valueB: any;

        if (this.sorting.column === 'portafolio' || this.sorting.column === 'estrategia') {
          valueA = a[this.sorting.column];
          valueB = b[this.sorting.column];
        }
        else if (this.sorting.column === 'inicioAlpha') {
          valueA = this.parseDateString(a[this.sorting.column]);
          valueB = this.parseDateString(b[this.sorting.column]);
        }
        else {
          valueA = a.rendimiento ? a.rendimiento[this.sorting.column] : null;
          valueB = b.rendimiento ? b.rendimiento[this.sorting.column] : null;
        }

        if (valueA == null) return 1;
        if (valueB == null) return -1;

        let comparison = 0;

        if (this.sorting.column === 'inicioAlpha') {
          comparison = valueA.getTime() - valueB.getTime();
        } else {
          comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        }

        return this.sorting.direction === 'asc' ? comparison : -comparison;
      });
    }

    this.resetPaginator();
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

  private parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    return new Date(year, month, day);
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

  toggleAll(event: MouseEvent) {
    event.stopPropagation();
    this.allExpanded = !this.allExpanded;
    this.displayedGroupedData.forEach(grupo => {
      if (grupo.benchmark) {
        grupo.isExpanded = this.allExpanded;
      }
    });
  }

  private resetFiltersAndSorting(): void {
    this.filters = {
      portafolio: '',
      inicioAlpha: '',
      anioAnterior: '',
      enero: '',
      febrero: '',
      marzo: '',
      abril: '',
      mayo: '',
      junio: '',
      julio: '',
      agosto: '',
      septiembre: '',
      octubre: '',
      noviembre: '',
      diciembre: '',
      enelAnio: '',
      activoInicio: '',
      activoFin: ''
    };
    this.sorting = {
      column: '',
      direction: 'asc'
    };

    this.expandedPortfolios.clear();
  }

}