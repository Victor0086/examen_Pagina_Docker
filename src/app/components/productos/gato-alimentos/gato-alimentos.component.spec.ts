import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatoAlimentosComponent } from './gato-alimentos.component';

describe('GatoAlimentosComponent', () => {
  let component: GatoAlimentosComponent;
  let fixture: ComponentFixture<GatoAlimentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatoAlimentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GatoAlimentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
