import { TestBed } from '@angular/core/testing';

import { PoliceReportService } from './police-report.service';

describe('PoliceReportService', () => {
  let service: PoliceReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PoliceReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
