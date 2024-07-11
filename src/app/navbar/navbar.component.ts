import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../pages/login/AuthService';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  homeButton: string = 'Inicio';
  dispersionButton: string = 'Dispercion';
  reportsButton: string = 'Carga de Reportes';
  logoutButton: string = 'cerrar cesión ';

  constructor(private router: Router, private authService: AuthService) {}

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}


