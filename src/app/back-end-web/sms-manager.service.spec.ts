import { TestBed, inject } from '@angular/core/testing';

import { SmsManagerService } from './sms-manager.service';

describe('SmsManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SmsManagerService]
    });
  });

  it('should be created', inject([SmsManagerService], (service: SmsManagerService) => {
    expect(service).toBeTruthy();
  }));
});
