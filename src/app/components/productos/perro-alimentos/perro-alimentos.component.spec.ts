import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerroAlimentosComponent } from './perro-alimentos.component';

describe('PerroAlimentosComponent', () => {
  let component: PerroAlimentosComponent;
  let fixture: ComponentFixture<PerroAlimentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerroAlimentosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerroAlimentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
