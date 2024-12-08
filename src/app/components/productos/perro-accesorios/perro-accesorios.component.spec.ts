import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerroAccesoriosComponent } from './perro-accesorios.component';

describe('PerroAccesoriosComponent', () => {
  let component: PerroAccesoriosComponent;
  let fixture: ComponentFixture<PerroAccesoriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerroAccesoriosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerroAccesoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
