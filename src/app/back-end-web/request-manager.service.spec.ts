import { TestBed, inject } from '@angular/core/testing';

import { RequestManagerService } from './request-manager.service';

describe('RequestManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestManagerService]
    });
  });

  it('should be created', inject([RequestManagerService], (service: RequestManagerService) => {
    expect(service).toBeTruthy();
  }));
});
