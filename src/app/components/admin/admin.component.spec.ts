import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AdminComponent], // Asegúrate de que ReactiveFormsModule está incluido
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form when trackingNumber is set', () => {
    // Asegúrate de que el formulario está inicializado correctamente
    component.trackingForm.get('trackingNumber')?.setValue('12345');
    component.trackingForm.get('orderStatus')?.setValue('En proceso');

    // Verifica que el formulario sea válido después de establecer los valores
    expect(component.trackingForm.valid).toBeTrue();
  });

  it('should show an error message when trackingNumber is not set', () => {
    // Asegúrate de que el formulario no tiene valor para trackingNumber
    component.trackingForm.get('trackingNumber')?.setValue('');
    component.trackingForm.get('orderStatus')?.setValue('En proceso');

    // Verifica que el formulario sea inválido debido al campo vacío
    expect(component.trackingForm.valid).toBeFalse();
  });
});
