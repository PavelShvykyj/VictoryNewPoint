import { TestBed, inject } from '@angular/core/testing';

import { WebInterceptorService } from './web-interceptor.service';

describe('WebInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebInterceptorService]
    });
  });

  it('should be created', inject([WebInterceptorService], (service: WebInterceptorService) => {
    expect(service).toBeTruthy();
  }));
});
