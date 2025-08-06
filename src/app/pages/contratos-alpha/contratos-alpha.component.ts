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
import { ConfirmDialogComponent } from './ConfirmDialogComponent';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';



@Component({
  selector: 'app-contratos-alpha',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatPaginatorModule, MatTooltipModule,
    MatDialogModule, MatButtonModule, MatSortModule, MatTableModule
  ],
  templateUrl: './contratos-alpha.component.html',
  styleUrl: './contratos-alpha.component.css'
})
export class ContratosAlphaComponent {
  displayedColumns: string[] = ['contrato', 'cliente', 'estrategia', 'fechaIniAlpha', 'estado'];
  dataSource = new MatTableDataSource<any>();
  estrategiasDisponibles: string[] = [];
  strategies: string[] = [];


  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'fechaIniAlpha') {
        const parts = item.fechaIniAlpha.split('/');
        return new Date(+parts[2], +parts[1] - 1, +parts[0]);
      }
      return item[property];
    };
  }



  lengRegister: number | null = null;
  isLoading = false;
  token = localStorage.getItem('token');
  apiUrl = environment.API_URL;

  datos: any[] = [];
  paginatedDatos: any[] = [];

  allSelected = false;
  filters = {
    contrato: '',
    cliente: '',
    estrategia: '',
    fecha: ''
  };

  constructor(
    private http: HttpClient,
    private estrategiasService: EstrategiasService,
    private dialog: MatDialog,
    private router: Router,
    private utilities: Utilities,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.loadContratos();
    this.loadStrategies();
    if (!token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
      return;
    }
  }


  private loadContratos(): void {

    this.isLoading = true;
    const url = `${this.apiUrl}/contrac/getReportes`;

    if (!this.token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<any[]>(url, { headers }).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.lengRegister = data.length;

        if (data && data.length > 0) {
          this.datos = data.map(item => ({
            contrato: item.contrato,
            cliente: item.nombreCliente || 'N/A',
            estrategia: item.estrategia || 'N/A',
            fechaIniAlpha: item.fechaIniAlpha,
            estado: item.estado ? 'Habilitado' : 'Deshabilitado'
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
          this.showDialog('MESSAGE', error.error.message);
        } else {
          this.showDialog('FAILED', 'Ocurrió un error al buscar los archivos.');
        }
      }
    });

  }


  loadStrategies(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.estrategiasService.getEstrategias(token).subscribe({
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


  openEstadoDialog(dato: any): void {
    const nuevoEstado = dato.estado === 'Habilitado' ? 'Deshabilitado' : 'Habilitado';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        mensaje: `¿Deseas cambiar el estado del contrato a "${nuevoEstado}"?`,
        contrato: dato.contrato,
        nuevoEstado: nuevoEstado
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.cambiarEstadoContrato(dato.contrato, nuevoEstado === 'Habilitado');
      }
    });
  }

  cambiarEstadoContrato(contratoId: string, estado: boolean): void {
    const url = `${this.apiUrl}/contrac/updateEstado`;
    const body = { contrato: contratoId, estado: estado };
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    this.http.post(url, body, { headers }).subscribe({

      next: (response: any) => {
        if (response.status === 'SUCCESS') {
          this.loadContratos();
          this.showDialog('SUCCESS', 'Contrato Acualizado');
        } else {
          this.showDialog('FAILED', response.message);
        }
      },
      error: (err) => {
        console.error('Error al actualizar contrato:', err);
        this.showDialog('FAILED', 'No se pudo actualizar el estado del contrato.');
      }
    });

  }

  applyFilters() {
    this.dataSource.filterPredicate = (dato, filtroTexto) => {
      const filtro = JSON.parse(filtroTexto);

      const contratoMatch = !filtro.contrato || dato.contrato.toString().includes(filtro.contrato);
      const clienteMatch = !filtro.cliente || dato.cliente.toLowerCase().includes(filtro.cliente.toLowerCase());
      const estrategiaMatch = !filtro.estrategia || dato.estrategia.toLowerCase() === filtro.estrategia.toLowerCase();
      const fechaMatch = !filtro.fecha || dato.fechaIniAlpha.toLowerCase().includes(filtro.fecha.toLowerCase());

      return contratoMatch && clienteMatch && estrategiaMatch && fechaMatch;
    };

    this.dataSource.filter = JSON.stringify(this.filters);

    if (this.paginator) {
      this.paginator.firstPage();
    }
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

  onPageChange(event: PageEvent): void {
    this.paginator.pageSize = event.pageSize;
    const startIndex = event.pageIndex * event.pageSize;
    const endIndex = startIndex + event.pageSize;
    this.paginatedDatos = this.datos.slice(startIndex, endIndex);
  }

}
