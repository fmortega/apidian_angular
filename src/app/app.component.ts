import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScrapingService } from './scraping.service'; // Importar el servicio
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [ FormsModule,CommonModule], // Importar módulos necesarios
})
export class AppComponent {
  title = 'scraping-pagina-dian';
  number: string = '';
  result: any = null;
  errorMessage: string = '';

  constructor(private scrapingService: ScrapingService) {}

  onSubmit() {
    this.scrapingService.scrapeNIT(this.number).subscribe({
      next: (data) => {
        this.result = data;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Error al hacer scraping: ' + error.message;
        this.result = null;
      },
    });
  }
}
