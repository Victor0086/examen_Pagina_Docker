import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  private jsonUrl = 'https://bucketmascotas.s3.us-east-1.amazonaws.com/personas.json'; 

  constructor(private http: HttpClient) {
    console.log('JsonService instanciado');
  }

  // Obtener datos del archivo JSON
  getJsonData(): Observable<any> {
    return this.http.get(this.jsonUrl); // Sin encabezados
  }

  // Método para sobrescribir el archivo JSON
  MetodoPersona(listaPersonas: any): void {
    this.http.put(this.jsonUrl, listaPersonas, this.httpOptions).subscribe(
      response => {
        console.log('Archivo JSON sobrescrito con éxito', response);
      },
      error => {
        console.error('Error al sobrescribir el archivo JSON', error);
      }
    );
  }

  // Obtener datos del carrito (si lo necesitas)
  getCarritoData(): Observable<any> {
    const carritoUrl = 'https://bucketmascotas.s3.us-east-1.amazonaws.com/carrito.json';
    return this.http.get(carritoUrl);
  }
}
