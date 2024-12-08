import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatoJuguetesComponent } from './gato-juguetes.component';

describe('GatoJuguetesComponent', () => {
  let component: GatoJuguetesComponent;
  let fixture: ComponentFixture<GatoJuguetesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatoJuguetesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatoJuguetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
