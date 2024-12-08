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
    this.jsonService.getJsonData().subscribe(data => {
      this.personas = data;
    });
  }

  eliminar(persona: any): void {
    const index = this.personas.findIndex((elemento: any) => elemento.id === persona.id);
    
    if (index !== -1) {
      this.personas.splice(index, 1);
      this.jsonService.MetodoPersona(this.personas);
    } else {
      window.alert('El elemento de la lista no existe');
    }
  }

  modificar(persona: any): void {
    const index = this.personas.findIndex((elemento: any) => elemento.id === persona.id);
    
    if (index !== -1) {
      this.personas[index].nombre = this.nombre;
      this.personas[index].edad = this.edad;
      this.jsonService.MetodoPersona(this.personas);
    } else {
      window.alert('El elemento de la lista no existe');
    }
  }

  addPerson(): void {
    const newPerson = {
      id: this.personas.length > 0 ? Math.max(...this.personas.map((p: any) => p.id)) + 1 : 1,
      nombre: this.nombre,
      edad: this.edad
    };
    this.personas.push(newPerson);
    this.jsonService.MetodoPersona(this.personas);
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