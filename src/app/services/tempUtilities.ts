import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Utilities {

    getMonthNames(): string[] {
        const months: string[] = [];
        const date = new Date();
        // Configurar el idioma en español
        const options = { month: 'long' } as const;
        for (let i = 0; i < 12; i++) {
            date.setMonth(i);
            months.push(date.toLocaleDateString('es-ES', options));
        }
        return months;
    }

}