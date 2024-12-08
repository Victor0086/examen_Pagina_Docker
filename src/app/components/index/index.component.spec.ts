import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndexComponent } from './index.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexComponent],  // Componente standalone
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} }  // Mock de ActivatedRoute
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
