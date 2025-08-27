import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, FormsModule],
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

    textarea {
      width: 100%;
      min-height: 80px;
      margin-top: 10px;
      padding: 10px;
      font-size: 1em;
      border-radius: 5px;
      border: 1px solid #ccc;
    }

    .error {
      color: red;
      font-size: 0.9em;
      margin-top: 5px;
    }
  `],
  template: `
    <h2 class="dialog-title">Confirmar cambio</h2>
    <mat-dialog-content class="dialog-content">
      <p>{{ data.mensaje }}</p>
      <label for="observaciones">Observaciones (obligatorio):</label>
      <textarea [(ngModel)]="observaciones" id="observaciones" placeholder="Explica por qué habilitas o deshabilitas el contrato..."></textarea>
      <div *ngIf="mostrarError" class="error">Las observaciones son obligatorias.</div>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-actions">
      <button mat-button class="upload-button" (click)="onCancel()">Cancelar</button>
      <button mat-button class="upload-button" (click)="onConfirm()">Confirmar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  observaciones: string = '';
  mostrarError: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    if (!this.observaciones.trim()) {
      this.mostrarError = true;
      return;
    }
    this.dialogRef.close({ confirmado: true, observaciones: this.observaciones });
  }

  onCancel(): void {
    this.dialogRef.close({ confirmado: false });
  }
}
