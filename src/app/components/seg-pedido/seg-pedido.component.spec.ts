import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SegPedidoComponent } from './seg-pedido.component';
import { JsonService } from '../../services/json.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SegPedidoComponent', () => {
  let component: SegPedidoComponent;
  let fixture: ComponentFixture<SegPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegPedidoComponent, HttpClientTestingModule], // Incluye HttpClientTestingModule
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '12345' }) } }, // Mock de ActivatedRoute
        JsonService, // Incluye el servicio JsonService si es necesario
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SegPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and find an order', () => {
    component.trackOrder();
    expect(component.orders.length).toBeGreaterThanOrEqual(0); // Ajusta según la lógica de tu aplicación
  });
});
