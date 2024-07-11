import { Component } from '@angular/core';
import { DispercionComponent } from '../dispercion/dispercion.component';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css'
})
export class PdfViewerComponent /*implements OnInit*/{

  pdfSrc: string | ArrayBuffer | null = null;

  constructor(private pdfService: DispercionComponent) { }

  ngOnInit(): void {
   // this.loadPdf();
  }

 /* loadPdf() {
    this.pdfService.getPdfData().subscribe(data => {
      const binarioPdf = data.binarioPdf;
      const blob = this.pdfService.getPdfBlob(binarioPdf);
      this.pdfSrc = URL.createObjectURL(blob);
    });
  }*/

}
