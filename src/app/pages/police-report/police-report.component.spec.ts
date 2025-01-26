import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliceReportComponent } from './police-report.component';

describe('PoliceReportComponent', () => {
  let component: PoliceReportComponent;
  let fixture: ComponentFixture<PoliceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
