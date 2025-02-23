import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliceReportFormComponent } from './police-report-form.component';

describe('PoliceReportFormComponent', () => {
  let component: PoliceReportFormComponent;
  let fixture: ComponentFixture<PoliceReportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliceReportFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliceReportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
