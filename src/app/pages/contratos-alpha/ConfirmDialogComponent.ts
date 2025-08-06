import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    styles: [`
    .dialog-title {
      font-size: 1.5em;
      margin-bottom: 20px;
      text-align: center;
    }

    .dialog-content {
      margin-bottom: 20px;
      font-size: 1em;
      text-align: center;
    }

    .dialog-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
    }

    .upload-button {
      background-color: #f5f7faff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 15px;
      cursor: pointer;
      font-size: 1em;
      text-align: center;
      display: inline-block;
      transition: background-color 0.3s ease;
    }

    .upload-button:hover {
      background-color: #041e42;
      color: white;
    }
  `],
    template: `
    <h2 class="dialog-title">Confirmar cambio</h2>
    <mat-dialog-content class="dialog-content">
      <p>{{ data.mensaje }}</p>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-actions">
      <button mat-button class="upload-button" (click)="onCancel()">Cancelar</button>
      <button mat-button class="upload-button" (click)="onConfirm()">Confirmar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
