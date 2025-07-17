import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Utilities } from '../../services/tempUtilities';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EstrategiasService } from '../dispercion/EstrategiasService';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Importa MatSnackBar
import { environment } from '../../../environments/environment';

export enum UploadMethod {
  DATES = 'DATES',
  FOLDER = 'FOLDER'
}

@Component({
  selector: 'app-reportes-alpha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-alpha.component.html',
  styleUrl: './reportes-alpha.component.css'
})

export class ReportesAlphaComponent {
  mensajeExito: string = '';
  mensajeError: string = '';
  contrato = '';
  nombreCliente = '';
  years: string[] = [];
  months: string[] = [];
  year = '';
  month = '';
  strategy = '';
  selectedYear = '';
  selectedMonth = '';
  selectedStrategy: string | null = null;
  strategies: string[] = [];
  mensaje = '';
  exito = false;
  isLoading = false;
  //uploadMethod: string = 'one';
  token: string | null = null;
  uploadMethod = 'one';
  apiUrl = environment.API_URL;
  disponibilidad: { [year: string]: string[] } = {};

  constructor(
    private http: HttpClient,
    private estrategiasService: EstrategiasService,
    private dialog: MatDialog,
    private router: Router,
    private utilities: Utilities,
    private snackBar: MatSnackBar // Añade esto
  ) { }

  ngOnInit(): void {
    this.loadStrategies();
    this.initializeDateOptions();
    this.token = localStorage.getItem('token'); // o de tu AuthService si lo tienes
    //this.getStrategies(); // opcional
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

  private initializeDateOptions(): void {
    const currentYear = new Date().getFullYear();
    const pastYears = currentYear - 10;
    for (let year = currentYear; year >= pastYears; year--) {
     // this.years.push(year);
      this.years = [];
    }
    this.months = this.utilities.getMonthNames();

  }


  buscarCliente(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
      return;
    }

    const url = '/api/reportesAlpha/buscar'; // Ajusta esta URL según tu backend
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { contrato: this.contrato };

    this.http.post(url, body, { headers }).subscribe(
      (response: any) => {
        switch (response.status) {
          case 'SUCCESS':    
          this.nombreCliente = response.nombreCliente;
          this.disponibilidad = response.disponibilidad;
          this.years = Object.keys(this.disponibilidad);
          this.months = []; 
            break;
          case 'FAILED':
            this.nombreCliente = '';
            this.years = [];
            this.months = [];
            this.showDialog('FAILED', response.message);
            break;
          default:
            this.showDialog('MESSAGE', 'Estado de respuesta desconocido');
        }
      },
      error => {
        this.showDialog('FAILED', 'Error al buscar cliente.', error.message);
        console.error(error);
      }
    );
  }

  
  onYearChange(selectedYear: string): void {
  this.months = this.disponibilidad[selectedYear] || [];
  }



  todosLosCamposLlenos(): boolean {
    return !!this.contrato && !!this.nombreCliente && !!this.year && !!this.month;
    // return this.contrato && this.nombreCliente && this.year && this.month;
  }

  generarReporte(): void {

    const body = {
      contrato: this.contrato,
      year: this.selectedYear,
      month: this.obtenerNumeroMes(this.selectedMonth)
    };

    this.isLoading = true;
    if (!this.todosLosCamposLlenos()) {
      const url = '/api/reportesAlpha/reporte-alpha';
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      this.http.post(url, body, { headers })
        .subscribe((response: any) => {
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
        }, error => {
          this.isLoading = false;
          this.showDialog('MESSAGE', 'Error al enviar archivos.', error.message);
          console.log(error.message);
        });
    } else {
      this.showDialog('FAILED', 'Por favor complete todos los campos.');
    }
  }




  uploadFolderPath(): void {
    if (!this.selectedYear || !this.selectedMonth || !this.selectedStrategy) {
      this.mostrarMensaje('Por favor seleccione año, mes y estrategia', 'error');
      return;
    }

    this.isLoading = true;
    const monthIndex = this.months.indexOf(this.selectedMonth) + 1;
    const url = '/api/reporte-alpha/generar-por-estrategia';

    const params = {
      year: this.selectedYear.toString(),
      month: monthIndex.toString(),
      strategy: this.selectedStrategy
    };

    const headers = this.token
      ? new HttpHeaders().set('Authorization', `Bearer ${this.token}`)
      : undefined;

    this.http.get<string>(url, { headers, params }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.mostrarMensaje(`Reportes generados para estrategia ${this.selectedStrategy}`, 'success');
      },
      error: (err) => {
        this.isLoading = false;
        this.mostrarMensaje(err.error || 'Error al generar reportes por estrategia', 'error');
      }
    });
  }

  // Método para mostrar mensajes
  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: tipo === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  obtenerNumeroMes(nombreMes: string): string {
    const index = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].indexOf(nombreMes) + 1;
    return index < 10 ? `0${index}` : `${index}`;

  }

  // Resto de métodos (showDialog, openRendimientosDialog, etc.) permanecen igual
  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

  setUploadMethod(method: string): void {
    this.uploadMethod = method;
  }

  


}
