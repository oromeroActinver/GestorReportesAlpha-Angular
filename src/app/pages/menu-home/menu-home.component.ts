import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-home.component.html',
  styleUrl: './menu-home.component.css'
})
export class MenuHomeComponent {

  cards = [
    {
      title: 'Característica 1',
      description: 'Descripción detallada de la primera característica importante de tu aplicación.',
      icon: '⭐',
      color: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    {
      title: 'Característica 2',
      description: 'Descripción de la segunda funcionalidad clave que ofrece tu producto o servicio.',
      icon: '🚀',
      color: 'bg-green-100',
      textColor: 'text-green-800'
    },
    {
      title: 'Característica 3',
      description: 'Tercer beneficio principal que quieres destacar para los usuarios.',
      icon: '🔒',
      color: 'bg-purple-100',
      textColor: 'text-purple-800'
    },
    {
      title: 'Característica 4',
      description: 'Cuarto elemento diferenciador que hace único tu producto en el mercado.',
      icon: '💡',
      color: 'bg-orange-100',
      textColor: 'text-orange-800'
    }
  ];

  // Función para rotar colores (opcional)
  rotateColors() {
    const lastCard = this.cards.pop();
        if (lastCard) {
    this.cards.unshift(lastCard);
        }
      }

}
