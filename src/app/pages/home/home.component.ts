import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../login/AuthService';
import { MatDialog } from '@angular/material/dialog';
import { MessageDetailsDialogComponent } from '../message-details-dialog/message-details-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  slideIndex = 0;
  intervalId: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.showSlides(this.slideIndex);
    this.startAutoSlide();
    const token = localStorage.getItem('token');

    if (token) {
      this.authService.validateToken(token).subscribe(
        response => {
          console.info("Token válido");
        },
        error => {
          if (error.error.token === "El token de autenticación ha expirado." || error.error.token === "El token de autenticación es inválido.") {
            this.showDialog('FAILED', error.error.token);
            this.router.navigate(['/']);
          } else {
            this.showDialog('FAILED', 'Error al validar el token');
            this.router.navigate(['/']);
          }
          console.error(error);
        }
      );
    } else {
      this.showDialog('FAILED', 'Usuario no autenticado.');
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }

  moveSlide(n: number) {
    this.showSlides(this.slideIndex += n);
  }

  showSlides(n: number) {
    let i;
    const slides = document.getElementsByClassName("slide") as HTMLCollectionOf<HTMLElement>;
    if (n >= slides.length) {
      this.slideIndex = 0;
    }
    if (n < 0) {
      this.slideIndex = slides.length - 1;
    }
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slides[this.slideIndex].style.display = "block";
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.moveSlide(1);
    }, 5000);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
