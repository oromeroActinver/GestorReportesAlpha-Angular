import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageDetailsDialogComponent } from '../pages/message-details-dialog/message-details-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeout: any;
  private readonly INACTIVITY_TIME = 1 * 60 * 1000; // 15 minutos
  

  constructor(private router: Router, private dialog: MatDialog) {
    this.startInactivityTimer();
    this.setupEventListeners();
  }

  private resetInactivityTimer() {
    clearTimeout(this.timeout);
    this.startInactivityTimer();
  }

  private startInactivityTimer() {
    this.timeout = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIME);
  }

  private setupEventListeners() {
    window.addEventListener('mousemove', () => this.resetInactivityTimer());
    window.addEventListener('keydown', () => this.resetInactivityTimer());
    // Puedes añadir otros eventos si es necesario
  }

  private logout() {
    // Lógica para cerrar sesión, eliminar token o redirigir al login
    //alert('Has sido desconectado por inactividad.');
    this.showDialog('FAILED', 'Su token a finalizado por inactividad.');
    this.router.navigate(['/']);
  }

  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }


}
