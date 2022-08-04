import { TestBed, inject } from '@angular/core/testing';

import { RequestRouterService } from './request-router.service';

describe('RequestRouterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequestRouterService]
    });
  });

  it('should be created', inject([RequestRouterService], (service: RequestRouterService) => {
    expect(service).toBeTruthy();
  }));
});
