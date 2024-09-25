import { Component, Inject  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-details-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-details-dialog.component.html',
  styleUrl: './message-details-dialog.component.css'
})
export class MessageDetailsDialogComponent {

  hasDetails: boolean = false;
  showDetails: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MessageDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { messageTitle: string, messageContent: string, details?: string[] }
  ) {
    this.hasDetails = !!data.details && data.details.length > 0;
  }

  get dialogClass(): string {
    switch (this.data.messageTitle) {
      case 'FAILED':
        return 'dialog-failed';
      case 'SUCCESS':
        return 'dialog-success';
      case 'PARTIAL SUCCESS':
        return 'dialog-partial-success';
      default:
        return '';
    }
  }
  
  toggleDetails(): void {
    this.showDetails = !this.showDetails;
    this.dialogRef.updateSize(this.showDetails ? '600px' : '400px');
  }
  
  onAccept(): void {
    this.dialogRef.close();
  }
}
