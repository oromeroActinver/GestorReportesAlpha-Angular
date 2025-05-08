import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-labs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labs.component.html',
  styleUrl: './labs.component.css'
})
export class LabsComponent {

  datos = [
    { selected: false, contrato: '51251256', cliente: 'Orlando@email.com', estrategia: 'Deuda', mes: 'Abril', ano: '2024', visualizador: 'Ir' },
    { selected: false, contrato: '51251256', cliente: 'Ismael@email.com', estrategia: 'Deuda', mes: 'Abril', ano: '2023', visualizador: 'Ir'},
    { selected: false, contrato: '51251256', cliente: 'Alonso@email.com', estrategia: 'Deuda', mes: 'Abril', ano: '2022', visualizador: 'Ir'}
  ];

  allSelected = false;

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.allSelected = checked;
    this.datos.forEach(dato => dato.selected = checked);
  }
  
}


