import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrapingService {

  private apiUrl = 'http://localhost:3000/scrape'; // URL del backend de Node.js

  constructor(private http: HttpClient) { }

  // Método para hacer una solicitud POST y enviar el número
  scrapeNIT(number: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { number }; // JSON que enviamos a la API

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
