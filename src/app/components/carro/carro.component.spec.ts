import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarroComponent } from './carro.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('CarroComponent', () => {
  let component: CarroComponent;
  let fixture: ComponentFixture<CarroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarroComponent],  // Componente standalone
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} }  // Mock de ActivatedRoute
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CarroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
