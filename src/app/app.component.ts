import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { InactivityService } from './services/InactivityService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'grAlfaFront';
  showNavbar = true;
  showFooter = true;
  isLoading: boolean = false;

  constructor(private router: Router, private inactivityService: InactivityService) { }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRoute(event.url);
      }
    });
    this.checkRoute(this.router.url);
  }
 
private checkRoute(url: string): void {
    const hideOnLogin = url === '/' || url.includes('/login');
    this.showNavbar = !hideOnLogin;
    this.showFooter = !hideOnLogin;
  }

}


