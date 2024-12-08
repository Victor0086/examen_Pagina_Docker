import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PruebasUnitariasComponent } from './pruebas-unitarias.component';

describe('PruebasUnitariasComponent', () => {
  let component: PruebasUnitariasComponent;
  let fixture: ComponentFixture<PruebasUnitariasComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, PruebasUnitariasComponent],  // Aquí se debe importar el componente como un módulo standalone
    }).compileComponents();

    fixture = TestBed.createComponent(PruebasUnitariasComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar mensaje de error si "nombreCompleto" está vacío', () => {
    const nombreCompletoInput: HTMLInputElement = compiled.querySelector('#nombreCompleto')!;
    
    // Vaciar el valor del input
    nombreCompletoInput.value = '';
    
    // Disparar el evento de input para simular un cambio
    nombreCompletoInput.dispatchEvent(new Event('input'));
    
    // Marcar el campo como tocado
    component.miRegistro.get('nombreCompleto')?.markAsTouched();
    
    fixture.detectChanges();

    // Verificar que el mensaje de error se muestre
    const error = compiled.querySelector('small');
    expect(error?.textContent).toContain('Nombre completo es requerido.');
  });

  it('debería deshabilitar el botón si el formulario es inválido', () => {
    const button: HTMLButtonElement = compiled.querySelector('button')!;
    expect(button.disabled).toBeTruthy();
  });
});