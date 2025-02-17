import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MAT_DATE_LOCALE  } from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {provideNativeDateAdapter} from '@angular/material/core';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';
import { EstrategiasService } from '../dispercion/EstrategiasService';

@Component({
  selector: 'app-rendimientos-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule
  ],
  templateUrl: './rendimientos-dialog.component.html',
  providers: [provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es' }  
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './rendimientos-dialog.component.css'
})
export class RendimientosDialogComponent {
  apiUrl = environment.API_URL;
  strategies: string[] = [];
  selectedStrategy: string | null = null;
  years: number[] = [];
  rendimientosForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RendimientosDialogComponent>,
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
  }


  // Función para formatear fecha a 'YYYYMMDD'
  formatDateToYYYYMMDD(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2); // Mes con cero inicial
    const day = (`0${d.getDate()}`).slice(-2); // Día con cero inicial
    return `${year}${month}${day}`;
  }

  onSubmit() {
    const username = localStorage.getItem('username');
    let token = null;
if (username) {
  const userTokens = JSON.parse(localStorage.getItem('user_tokens') || '{}');
  token = userTokens[username];
  // Aquí puedes continuar con la lógica para utilizar el token
} else {
  // Manejar el caso donde 'username' es null o no existe en localStorage
  console.error('No se encontró el nombre de usuario en localStorage.');
}


    //const token = localStorage.getItem('token');
    this.isLoading = true;

    const formData = this.rendimientosForm.value;

    // Validación: verificar que al menos fechas mensuales o anuales estén completas
    const fechasMensualesCompletas = formData.fechaInicioMensual && formData.fechaFinMensual;
    const fechasAnualesCompletas = formData.fechaInicioAnual && formData.fechaFinAnual;

    if (!fechasMensualesCompletas && !fechasAnualesCompletas) {
      this.isLoading = false;
      this.showDialog('FAILED', 'Debe completar al menos las fechas mensuales o las fechas anuales.');
      return;
    }
  
    // Validación: fechas finales deben ser mayores que las fechas de inicio
    if (fechasMensualesCompletas) {
      const inicioMensual = new Date(formData.fechaInicioMensual);
      const finMensual = new Date(formData.fechaFinMensual);
      if (finMensual <= inicioMensual) {
        this.isLoading = false;
        this.showDialog('FAILED', 'La fecha fin mensual debe ser mayor que la fecha inicio mensual.');
        return;
      }
    }
  
    if (fechasAnualesCompletas) {
      const inicioAnual = new Date(formData.fechaInicioAnual);
      const finAnual = new Date(formData.fechaFinAnual);
      if (finAnual <= inicioAnual) {
        this.isLoading = false;
        this.showDialog('FAILED', 'La fecha fin anual debe ser mayor que la fecha inicio anual.');
        return;
      }
    }

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const body = [
        { 
          fechInicio: fechasMensualesCompletas ? this.formatDateToYYYYMMDD(formData.fechaInicioMensual) : null, 
          fechFinal: fechasMensualesCompletas ? this.formatDateToYYYYMMDD(formData.fechaFinMensual) : null 
        },
        { 
          fechInicio: fechasAnualesCompletas ? this.formatDateToYYYYMMDD(formData.fechaInicioAnual) : null, 
          fechFinal: fechasAnualesCompletas ? this.formatDateToYYYYMMDD(formData.fechaFinAnual) : null 
        }
      ];

      const url = '/api/a2k/fechs';

      this.http.post(url, body, { headers }).subscribe(
        (response: any) => {
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
              this.showDialog('FAILED', 'Estado de respuesta desconocido');
          }
          //this.closeDialog();
        },
        error => {
          this.isLoading = false;
          this.showDialog('FAILED', 'Error: 404 no llego la peticion al Back');
          console.log(error.message)
        }
      );
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
    this.closeDialog();
  }

  showDialog(title: string, content: string, details?: string[]): void {
    //this.closeDialog();
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
