import { TestBed } from '@angular/core/testing';
import { JsonService } from './json.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('JsonService', () => {
  let service: JsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Importa HttpClientTestingModule
      providers: [JsonService],
    });
    service = TestBed.inject(JsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
