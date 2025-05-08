
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstrategiasService } from './EstrategiasService';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Utilities } from '../../services/tempUtilities';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dispercion',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatPaginatorModule, MatTooltipModule],
  templateUrl: './dispercion.component.html',
  styleUrls: ['./dispercion.component.css']
})

export class DispercionComponent implements AfterViewInit {
  searchFilesButton: string = 'Buscar';
  sendfiles: string = 'Enviar';
  selectedYear: number | null = null;
  selectedMonth: string | null = null;
  selectedStrategy: string | null = null;
  pdfSrc: string | null = null;
  anySelected = false;
  contrato: number | null = null;
  mes: number | null = null;
  ano: number | null = null;
  lengRegister: number | null = null;
  isLoading: boolean = false;

  token = localStorage.getItem('token');
  years: number[] = [];
  months: string[] = [];
  strategies: string[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  datos: any[] = [];
  paginatedDatos: any[] = [];
  dataSource = new MatTableDataSource<any>();
  allSelected: boolean = false;

  constructor(private http: HttpClient, private estrategiasService: EstrategiasService, private utilities: Utilities,
    private router: Router, private dialog: MatDialog
  ) {
    const currentYear = new Date().getFullYear();
    this.months = utilities.getMonthNames();
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

  ngAfterViewInit() {
    this.paginator.pageSize = this.paginator.pageSize || 5;
    this.dataSource.paginator = this.paginator;
    this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
}


  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.allSelected = checked;
    this.datos.forEach(dato => dato.selected = checked);
    this.updateAnySelected();
  }

  clearSelections() {
    this.datos.forEach(dato => dato.selected = false);
  }

  searchFiles() {
    if (this.selectedYear && this.selectedMonth && this.selectedStrategy) {
      this.isLoading = true;
      const monthIndex = this.months.indexOf(this.selectedMonth) + 1;
      const url = '/api/files/filesByCriteria';
      const params = {
        year: this.selectedYear.toString(),
        month: monthIndex.toString(),
        strategy: this.selectedStrategy
      };

      if (this.token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
        this.http.post<any[]>(url, null, { headers, params })
          .subscribe(data => {
            this.isLoading = false;
            this.lengRegister = data.length;
            if (data && data.length > 0) {
              this.datos = data.map(item => ({
                selected: false,
                contrato: item.archivoAlphaPDFId.contrato,
                cliente: item.correoCliente || 'N/A',
                estrategia: item.estrategia || 'N/A',
                mes: this.months[item.archivoAlphaPDFId.mes - 1],
                ano: item.archivoAlphaPDFId.ano,
                nombrePdf: item.nombrePdf,
                visualizador: 'description',
              }));
              this.dataSource.data = this.datos;
              this.paginator.firstPage();
              this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
              this.paginator.length = this.datos.length;
            } else {
              this.datos = [];
              this.dataSource.data = [];
              this.paginatedDatos = this.datos.slice(0, this.paginator.pageSize);
              this.showDialog('MESSAGE', 'No existen registros.');
            }
          }, error => {

            this.isLoading = false;
            this.showDialog('FAILED', 'Ocurrió un error al buscar los archivos.');
          });
      } else {
        this.showDialog('FAILED', 'Usuario no autenticado.');
      }
    } else {
      this.showDialog('MESSAGE', 'Por favor, seleccione Año, Mes y Estrategia.');
    }
  }

  updateAnySelected() {
    this.anySelected = this.datos.some(dato => dato.selected);
  }

  sendFiles() {
    this.isLoading = true;
    const selectedFiles = this.datos
      .filter(dato => dato.selected)
      .map(dato => ({
        contrato: dato.contrato,
        mes: this.months.indexOf(dato.mes) + 1,
        ano: dato.ano
      }));

    if (selectedFiles.length > 0) {
      const url = '/api/files/sendSelectedFiles';
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      this.http.post(url, selectedFiles, { headers })
        .subscribe((response: any) => {
          this.anySelected = false;
          this.isLoading = false;
          switch (response.status) {
            case 'SUCCESS':
              this.showDialog('SUCCESS', response.message, response.details);
              this.clearSelections();
              break;
            case 'FAILED':
              this.showDialog('FAILED', response.message, response.details);
              this.clearSelections();
              break;
            case 'PARTIAL_SUCCESS':
              this.showDialog('PARTIAL SUCCESS', response.message, response.details);
              this.clearSelections();
              break;
            default:
              this.showDialog('MESSAGE', 'Estado de respuesta desconocido');
          }
        }, error => {
          this.isLoading = false;
          this.showDialog('MESSAGE', 'Error al enviar archivos.', error.message);
          console.log(error.message);
        });
    } else {
      this.showDialog('MESSAGE', 'No hay archivos seleccionados para enviar.');
    }
  }

  viewPDF(contrato: number, estrategia: string): void {
    this.isLoading = true;
    if (this.selectedYear && this.selectedMonth) {
      const monthIndex = this.months.indexOf(this.selectedMonth) + 1;
      const url = `/api/files/pdf/${contrato}`;
      const params = {
        year: this.selectedYear.toString(),
        month: monthIndex.toString(),
        strategy: estrategia
      };

      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      this.http.get(url, { responseType: 'blob', headers, params }).subscribe((response: Blob) => {
        this.isLoading = false;
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
    }
  }

onPageChange(event: PageEvent): void {
  this.paginator.pageSize = event.pageSize;
  const startIndex = event.pageIndex * event.pageSize;
  const endIndex = startIndex + event.pageSize;
  this.paginatedDatos = this.datos.slice(startIndex, endIndex);
}


  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

  filters = {
    contrato: ''
  };

  applyFilters() {
    this.paginatedDatos = this.datos.filter(dato => {
      return (
        !this.filters.contrato || dato.contrato.toString().includes(this.filters.contrato)
      );
    });
    this.paginator.length = this.paginatedDatos.length;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    this.paginatedDatos = this.paginatedDatos.slice(startIndex, startIndex + this.paginator.pageSize);
  }
  

}

