import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { throwError } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class JsonService {
  private useLocalStorage: boolean = true; // Cambiar entre LocalStorage y S3

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  // URLs para los archivos JSON en S3
  private urls = {
    admin: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/admin.json',
    cart: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/cart.json',
    purchases: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/purchases.json',
    users: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/users.json',
    carrito: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/carrito.json',
    personas: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/personas.json',
    soportecliente: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/soportecliente.json',
    vendedor: 'https://bucketmascotas.s3.us-east-1.amazonaws.com/vendedor.json',
    
  };

  constructor(private http: HttpClient) {
    console.log('JsonService instanciado');
  }

  // Alternar entre LocalStorage y S3
  toggleStorageMethod(useLocal: boolean): void {
    this.useLocalStorage = useLocal;
    console.log('Método de almacenamiento cambiado a:', useLocal ? 'LocalStorage' : 'S3');
  }
  getCurrentStorageMethod(): boolean {
    return this.useLocalStorage;
  }

  // Obtener datos de un archivo JSON específico
  getJsonData(resource: keyof typeof this.urls): Observable<any> {
    return this.http.get(this.urls[resource]).pipe(
      // Si la solicitud a S3 tiene éxito, devuelve los datos
      catchError((error: any) => {
        console.error(`Error obteniendo datos de S3 para ${resource}:`, error);
  
        // Si falla, intenta obtener los datos de LocalStorage
        const localData = localStorage.getItem(resource);
        if (localData) {
          console.log(`Datos obtenidos de LocalStorage para ${resource}:`);
          return of(JSON.parse(localData));
        } else {
          console.warn(`No se encontraron datos en LocalStorage para ${resource}.`);
          return of([]); // Devuelve un array vacío si no hay datos en LocalStorage
        }
      })
    );
  }


  // Guardar datos en un archivo JSON específico
  saveJsonData(resource: keyof typeof this.urls, data: any): Observable<any> {
    console.log(`Iniciando guardado de datos para ${resource}...`); 
  
    return new Observable((observer) => {
      // Guardar primero en S3
      console.log(`Intentando guardar datos en S3 para ${resource}:`, data);
      this.http
        .put(this.urls[resource], data, {
          headers: { 'Content-Type': 'application/json' },
        })
        .subscribe({
          next: (response) => {
            console.log(`Archivo ${resource}.json sobrescrito en S3 con éxito.`, response);
            // Guardar en LocalStorage después de guardar en S3
            localStorage.setItem(resource, JSON.stringify(data));
            console.log(`Datos sincronizados con LocalStorage para ${resource}:`, data);
            // Emitir éxito en el Observable
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error(`Error al sobrescribir el archivo ${resource}.json en S3`, error);
            // Guardar solo en LocalStorage como respaldo
            localStorage.setItem(resource, JSON.stringify(data));
            console.warn(`Datos guardados en LocalStorage para ${resource} como respaldo.`, data);
            // Emitir respuesta de respaldo
            observer.next(`Datos guardados en LocalStorage para ${resource} como respaldo.`);
            observer.complete();
          },
        });
    });
  }
  
  
  

  // Métodos  para personas
  getPersonas(): Observable<any> {
    return this.getJsonData('personas');
  }

  MetodoPersona(listaPersonas: any): void {
    this.saveJsonData('personas', listaPersonas);
  }

  // Obtener datos del carrito
  getCarritoData(): Observable<any> {
    return this.getJsonData('cart');
  }

  saveCarritoData(cart: any): void {
    this.saveJsonData('cart', cart);
  }

  // Métodos para manejar compras
  getPurchases(): Observable<any> {
    return this.getJsonData('purchases');
  }

  savePurchases(purchases: any): Observable<any> {
    return this.saveJsonData('purchases', purchases);
  }
  

  // Métodos para manejar usuarios
  getUsers(): Observable<any> {
    return this.getJsonData('users');
  }

  saveUsers(users: any[]): Observable<any> {
    return this.saveJsonData('users', users);
  }
  

  // Métodos para manejar admin
  getAdminData(): Observable<any> {
    return this.getJsonData('admin');
  }

  saveAdminData(adminData: any): void {
    this.saveJsonData('admin', adminData);
  }

  
  // Métodos para manejar soporteCliente
  getSoporteCliente(): Observable<any> {
    return this.getJsonData('soportecliente');
  }

  saveSoporteCliente(SoporteCliente: any[]): Observable<any> {
    return this.saveJsonData('soportecliente', SoporteCliente);
  }

  // Métodos para manejar Vendedor
  getVendedor(): Observable<any> {
     return this.getJsonData('vendedor');
  }
  
  saveVendedor(Vendedor: any[]): Observable<any> {
    return this.saveJsonData('vendedor', Vendedor);
  }


}
