import { TestBed } from '@angular/core/testing';

import { NgxGlobusSdkService } from './ngx-globus-sdk.service';

describe('NgxGlobusSdkService', () => {
  let service: NgxGlobusSdkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxGlobusSdkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
