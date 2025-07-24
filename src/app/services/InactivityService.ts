import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MessageDetailsDialogComponent } from '../pages/message-details-dialog/message-details-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private timeoutMinutes = 120; // 3 horas
  private checkInterval = 600000; // 1 minuto


  constructor(private router: Router, private dialog: MatDialog) {
    this.initListeners();
    this.startInactivityCheck();
  }

  private initListeners(): void {
    ['click', 'mousemove', 'keydown'].forEach(event =>
      window.addEventListener(event, () => this.updateLastActivity())
    );
  }

  private updateLastActivity(): void {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  private startInactivityCheck(): void {
    setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0', 10);
      const now = Date.now();
      const diffMinutes = (now - lastActivity) / 1000 / 60;

      if (diffMinutes > this.timeoutMinutes) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }, this.checkInterval);
  }


  showDialog(title: string, content: string, details?: string[]): void {
    this.dialog.open(MessageDetailsDialogComponent, {
      width: '300px',
      data: { messageTitle: title, messageContent: content, details: details }
    });
  }


}
