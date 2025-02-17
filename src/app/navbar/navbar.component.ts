import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../pages/login/AuthService';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [MatIconModule, MatTooltipModule],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  dispersionButton = 'Dispercion';
  reportsButton = 'Carga de Reportes';
  logoutButton = 'cerrar cesión ';

  constructor(private router: Router, private authService: AuthService) {}

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}


