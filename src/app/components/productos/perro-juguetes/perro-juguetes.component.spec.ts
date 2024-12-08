import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerroJuguetesComponent } from './perro-juguetes.component';

describe('PerroJuguetesComponent', () => {
  let component: PerroJuguetesComponent;
  let fixture: ComponentFixture<PerroJuguetesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerroJuguetesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerroJuguetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
