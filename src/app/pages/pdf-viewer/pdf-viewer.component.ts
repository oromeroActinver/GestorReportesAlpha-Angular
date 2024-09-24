import { Component } from '@angular/core';
import { DispercionComponent } from '../dispercion/dispercion.component';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css'
})
export class PdfViewerComponent {

  pdfSrc: string | ArrayBuffer | null = null;

  constructor(private pdfService: DispercionComponent) { }

  ngOnInit(): void {
  }

}
