import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JsonService } from '../../services/json.service';
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-pruebas-unitarias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,HttpClientModule],
  templateUrl: './pruebas-unitarias.component.html',
  styleUrls: ['./pruebas-unitarias.component.css']
})
export class PruebasUnitariasComponent {

  miRegistro!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.miRegistro = this.fb.group({
      nombreCompleto: ['', Validators.required], // Prueba Unitaria 1: Validar si el campo nombreCompleto es requerido.
      nombreUsuario: ['', Validators.required],  // Prueba Unitaria 2: Validar si el campo nombreUsuario es requerido.
      email: ['', [Validators.required, Validators.email]], // Prueba 3: Validar si el "email" es requerido y tiene formato de email.
      password: ['', [
        Validators.required,               // Prueba Unitaria 4: Validar si password es requerido.
        Validators.minLength(6),           // Prueba Unitaria 5: Validar que la password tenga al menos 6 caracteres.
        Validators.maxLength(18),          // Prueba Unitaria 6: Validar que la password no tenga más de 18 caracteres.
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$') // Prueba Unitaria 7: Validar que "password" tenga al menos una mayúscula y un número.
      ]],
      confirmPassword: ['', Validators.required], // Prueba Unitaria 8: Validar si confirmPassword es requerido.
      fechaNacimiento: ['', [
        Validators.required,               // Prueba Unitaria 9: Validar que fechaNacimiento sea requerido.
        this.validarEdadMinima(13)         // Prueba Unitaria 10: Validar que la edad sea mayor o igual a 13 años.
      ]],
      direccion: [''] 
    }, {
      validators: this.passwordsIguales 
    });
  }

  passwordsIguales(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true }; 
  }

  validarEdadMinima(edadMinima: number) {
    return (control: any) => {
      const fechaNacimiento = new Date(control.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const mes = hoy.getMonth() - fechaNacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }
      return edad >= edadMinima ? null : { edadMinima: true }; 
    };
  }

 
  onSubmit(): void {
    if (this.miRegistro.valid) {
      console.log('Formulario válido:', this.miRegistro.value);
    } else {
      console.log('Formulario inválido');
      this.miRegistro.markAllAsTouched();
    }
  }
}
