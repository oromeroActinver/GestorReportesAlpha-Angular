import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstrategiasService } from './EstrategiasService';

@Component({
  selector: 'app-dispercion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dispercion.component.html',
  styleUrls: ['./dispercion.component.css']
})
export class DispercionComponent {
  searchFilesButton: string = 'Buscar';
  sendfiles: string = 'Enviar';
  selectedYear: number | null = null;
  selectedMonth: string | null = null;
  selectedStrategy: string | null = null;
  pdfSrc: string | null = null;
  anySelected: boolean = false;
  contrato: number | null = null;
  mes: number | null = null;
  ano: number | null = null;
  verPDF: string = 'Ver PDF';


  token = localStorage.getItem('token');

  years: number[] = [];
  months: string[] = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  strategies: string[] = [];

  constructor(private http: HttpClient, private estrategiasService: EstrategiasService) {
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
          console.error('Error al obtener estrategias', error);
        }
      );
    } else {
      alert('Usuario no autenticado.');
    }

   }

  datos: any[] = [];
  currentPage = 1; // Página actual inicial
  itemsPerPage = 10; // Número de elementos por página

  allSelected: boolean = false;

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.allSelected = checked;
    this.datos.forEach(dato => dato.selected = checked);
    this.updateAnySelected(); 
  }

  // Método para limpiar las selecciones
clearSelections() {
  this.datos.forEach(dato => dato.selected = false);
}

searchFiles() {
  if (this.selectedYear && this.selectedMonth && this.selectedStrategy) {
    const monthIndex = this.months.indexOf(this.selectedMonth) + 1; // Convertir mes a índice (1-based)
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
          if (data && data.length > 0) {
            this.datos = data.map(item => ({
              selected: false,
              contrato: item.archivoAlphaPDFId.contrato,
              cliente: item.correoCliente || 'N/A',
              estrategia: item.estrategia,
              mes: this.months[item.archivoAlphaPDFId.mes - 1],
              ano: item.archivoAlphaPDFId.ano,
              nombrePdf: item.nombrePdf,
              visualizador: this.verPDF,
            }));
          } else {
            alert('No existen registros.');
          }
        }, error => {
          console.error('Error fetching files:', error);
          alert('Ocurrió un error al buscar los archivos.');
        });
    } else {
      alert('Ususario No se autentifico.');
    }
  } else {
    alert('Por favor, seleccione Año, Mes y Estrategia.');
  }
}


  // Método para actualizar anySelected basado en la selección de checkboxes
  updateAnySelected() {
    this.anySelected = this.datos.some(dato => dato.selected);
}

sendFiles() {
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
        switch (response.status) {
          case 'SUCCESS':
            alert(response.message + '\n' + response.details.join('\n'));
            this.clearSelections(); 
            break;
          case 'FAILED':
            alert(response.message + '\n' + response.details.join('\n'));
            this.clearSelections();
            break;
          case 'PARTIAL_SUCCESS':
            alert(response.message + '\n' + response.details.join('\n'));
            this.clearSelections();
            break;
          default:
            alert('Estado de respuesta desconocido');
        }
      }, error => {
        alert('Error al enviar archivos: ' + error.message);
      });
  } else {
    alert('No hay archivos seleccionados para enviar.');
  }
}

  viewPDF(contrato: number, estrategia: string): void {
    if (this.selectedYear && this.selectedMonth ) {
      const monthIndex = this.months.indexOf(this.selectedMonth) + 1; // Convertir mes a índice (1-based)
      const url = `/api/files/pdf/${contrato}`;
      const params = {
        year: this.selectedYear.toString(),
        month: monthIndex.toString(),
        strategy: estrategia
      };

      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      this.http.get(url, { responseType: 'blob', headers, params }).subscribe((response: Blob) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
      });
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event;
  }

  

  /* ----------- Para implemetar el Paguinador 
  ////Terminal
  npm install ngx-pagination --save

  /////app.module.ts
  import { NgxPaginationModule } from 'ngx-pagination'; // Asegúrate de importar correctamente ngx-pagination
  import { DispercionComponent } from './dispercion/dispercion.component';

  @NgModule({
  declarations: [
    DispercionComponent // Añade tu componente aquí
    // Otros componentes
  ],
  imports: [
    BrowserModule,
    NgxPaginationModule // Añade el módulo de paginación aquí
  ],
  providers: [],
  bootstrap: [DispercionComponent] // Asegúrate de incluir tu componente como bootstrap si es necesario
})
export class AppModule { }
  */
  
}