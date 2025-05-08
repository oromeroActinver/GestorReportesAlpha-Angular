import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../pages/login/AuthService';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
//import { RendimientosComponent } from '../pages/rendimientos/rendimientos.component';
import { RendimientosDialogComponent } from '../pages/rendimientos-dialog/rendimientos-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
//import { MatMenuModule } from '@angular/material/menu';
//import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [MatIconModule, MatTooltipModule, MatMenuModule, MatDividerModule],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  dispersionButton: string = 'Dispercion';
  dispersionAlphaButton: string = 'Dispercion Alpha';
  reportsButton: string = 'Carga de Reportes';
  logoutButton: string = 'cerrar cesión ';
  rendiAlphaButton: string = 'Rendimientos Alpha';
  newMenu: string = 'Nuevo Home';
  

  constructor(private router: Router, private authService: AuthService, private dialog: MatDialog) {}

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  openRendimientosDialog() {
    this.dialog.open(RendimientosDialogComponent, {
      width: '900px',  // Ajusta el ancho
      height: '300px',  // Ajusta la altura
      panelClass: 'custom-dialog',  // Clase CSS personalizada
    });
  }
  

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}


