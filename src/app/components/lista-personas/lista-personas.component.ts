import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonService } from '../../services/json.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-personas',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './lista-personas.component.html',
  styleUrls: [],
  providers: [JsonService]
})
export class ListaPersonasComponent implements OnInit {

  personas: any[] = [];
  nombre: string = '';
  edad: number | null = null;

  constructor(private jsonService: JsonService) {}

  ngOnInit(): void {
    this.jsonService.getJsonData('personas').subscribe({
      next: (data: any[]) => {
        console.log('Datos de personas cargados:', data);
        this.personas = data; // Asigna los datos cargados a la propiedad `personas`
      },
      error: (err) => {
        console.error('Error al cargar datos de personas:', err);
      }
    });
  }
  

  eliminar(persona: any): void {
    const index = this.personas.findIndex((p: any) => p.id === persona.id);
    if (index !== -1) {
      this.personas.splice(index, 1);
      this.jsonService.saveJsonData('personas', this.personas).subscribe({
        next: () => {
          console.log('Datos actualizados en S3 tras eliminar persona.');
          // Revalidar desde S3
          this.jsonService.getJsonData('personas').subscribe({
            next: (data) => {
              console.log('Validación: Datos actuales en S3:', data);
              // Puedes comparar los datos obtenidos con `this.personas` para asegurar consistencia
            },
            error: (err) => console.error('Error al validar datos en S3:', err),
          });
        },
        error: (err) => console.error('Error al guardar en S3:', err),
      });
    } else {
      alert('La persona no existe en la lista.');
    }
  }
  
  

  modificar(persona: any): void {
    const index = this.personas.findIndex((p: any) => p.id === persona.id);
    if (index !== -1) {
      // Actualizar los datos de la persona en la lista local
      this.personas[index].nombre = this.nombre;
      this.personas[index].edad = this.edad;
  
      // Guardar los datos actualizados en S3
      this.jsonService.saveJsonData('personas', this.personas).subscribe({
        next: () => {
          console.log('Datos actualizados en S3 tras modificar persona.');
          // Revalidar desde S3
          this.jsonService.getJsonData('personas').subscribe({
            next: (data) => {
              console.log('Validación: Datos actuales en S3 tras modificar:', data);
            },
            error: (err) => console.error('Error al validar datos en S3 tras modificar:', err),
          });
        },
        error: (err) => console.error('Error al guardar en S3 tras modificar:', err),
      });
    } else {
      alert('La persona no existe en la lista.');
    }
  }
  

  addPerson(): void {
    if (this.nombre && this.edad !== null) {
      // Crear un nuevo objeto persona
      const newPerson = {
        id: this.personas.length > 0 ? Math.max(...this.personas.map((p: any) => p.id)) + 1 : 1,
        nombre: this.nombre,
        edad: this.edad,
      };
  
      // Agregar la nueva persona a la lista local
      this.personas.push(newPerson);
  
      // Guardar los datos actualizados en S3
      this.jsonService.saveJsonData('personas', this.personas).subscribe({
        next: () => {
          console.log('Datos actualizados en S3 tras agregar persona.');
          // Revalidar desde S3
          this.jsonService.getJsonData('personas').subscribe({
            next: (data) => {
              console.log('Validación: Datos actuales en S3 tras agregar:', data);
            },
            error: (err) => console.error('Error al validar datos en S3 tras agregar:', err),
          });
        },
        error: (err) => console.error('Error al guardar en S3 tras agregar:', err),
      });
  
      // Limpiar los campos del formulario
      this.nombre = '';
      this.edad = null;
    } else {
      alert('Por favor, ingrese un nombre y una edad válidos.');
    }
  }
  
  

  submitForm(): void {
    if (this.nombre && this.edad !== null) {
      this.addPerson();
      this.nombre = '';
      this.edad = null;
    } else {
      window.alert('Por favor, ingrese un nombre y una edad válidos');
    }
  }


  
}  