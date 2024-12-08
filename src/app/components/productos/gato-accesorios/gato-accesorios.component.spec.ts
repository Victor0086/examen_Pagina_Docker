import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GatoAccesoriosComponent } from './gato-accesorios.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('GatoAccesoriosComponent', () => {
  let component: GatoAccesoriosComponent;
  let fixture: ComponentFixture<GatoAccesoriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatoAccesoriosComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Mock de los parámetros de la ruta
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GatoAccesoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
